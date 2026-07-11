"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

// ── Omdömen ───────────────────────────────────────────────────────

export async function submitReview(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      success: false,
      error: "Du måste vara inloggad för att lämna ett omdöme.",
    };

  const profile = await prisma.profile
    .findUnique({ where: { userId: user.id }, select: { id: true } })
    .catch(() => null);
  if (!profile) return { success: false, error: "Profil saknas." };

  const productId = formData.get("productId") as string;
  const ratingRaw = parseInt(String(formData.get("rating") ?? "0"), 10);
  if (ratingRaw < 1 || ratingRaw > 5)
    return { success: false, error: "Välj ett betyg 1–5." };

  const title = (formData.get("title") as string | null)?.trim() || null;
  const content = (formData.get("content") as string | null)?.trim() || null;

  // Check if verified purchase
  const order = await prisma.shopOrder
    .findFirst({
      where: {
        userId: profile.id,
        status: { in: ["paid", "completed", "shipped"] },
        items: { some: { productId } },
      },
      select: { id: true },
    })
    .catch(() => null);

  const isVerifiedPurchase = !!order;

  try {
    await prisma.shopProductReview.upsert({
      where: { productId_userId: { productId, userId: profile.id } },
      update: { rating: ratingRaw, title, content, status: "pending" },
      create: {
        productId,
        userId: profile.id,
        orderId: order?.id ?? null,
        rating: ratingRaw,
        title,
        content,
        isVerifiedPurchase,
        status: "pending",
      },
    });
    revalidatePath(`/butik/produkt`);
    return { success: true };
  } catch {
    return { success: false, error: "Kunde inte spara omdömet." };
  }
}

interface CartItemData {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

// ── Stripe checkout session ────────────────────────────────────────

export async function createCheckoutSession(
  formData: FormData
): Promise<{ success: boolean; sessionUrl?: string; orderId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const cartItemsJson = formData.get("cartItems") as string;
    const cartItems: CartItemData[] = JSON.parse(cartItemsJson);
    if (!cartItems?.length) return { success: false, error: "Varukorgen är tom." };

    const fullName    = (formData.get("fullName") as string).trim();
    const email       = (formData.get("email") as string).trim();
    const phone       = (formData.get("phone") as string | null)?.trim() || null;
    const address     = (formData.get("address") as string).trim();
    const city        = (formData.get("city") as string).trim();
    const postalCode  = (formData.get("postalCode") as string).trim();
    const discountCode   = (formData.get("discountCode") as string | null)?.trim() || null;

    // Hämta auktoritativa priser/namn från DB – lita aldrig på klientens värden.
    const products = await prisma.shopProduct.findMany({
      where: { id: { in: cartItems.map((i) => i.productId) } },
      select: { id: true, name: true, price: true, stockQuantity: true, isActive: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Verifiera lager och bygg rader från DB-data
    const lineItems: Array<{ productId: string; name: string; price: number; quantity: number }> = [];
    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
      if (!product?.isActive) return { success: false, error: `"${item.name}" är inte tillgänglig.` };
      if (product.stockQuantity < quantity) return { success: false, error: `Otillräckligt lager för "${product.name}".` };
      lineItems.push({ productId: product.id, name: product.name, price: product.price, quantity });
    }

    const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 49900 ? 0 : 4900;

    // Validera rabattkoden server-side – aldrig lita på klientens belopp.
    let discountAmount = 0;
    if (discountCode) {
      const result = await validateDiscount(
        discountCode,
        subtotal,
        lineItems.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
      );
      if (!result.success) return { success: false, error: result.error };
      discountAmount = result.discountAmount ?? 0;
    }

    const totalAmount = Math.max(0, subtotal + shipping - discountAmount);

    // Koppla till profil om inloggad, eller sök via e-post
    let profileId: string | null = null;
    if (user) {
      const prof = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
      profileId = prof?.id ?? null;
    }

    // Skapa order (pending_payment)
    const order = await prisma.shopOrder.create({
      data: {
        userId: profileId,
        email, fullName, phone,
        shippingAddress: { address, city, postalCode, country: "SE" },
        subtotal, shippingAmount: shipping, discountAmount, totalAmount,
        status: "pending_payment",
        items: {
          create: lineItems.map((item) => ({
            productId: item.productId,
            productName: item.name,
            unitPrice:   item.price,
            quantity:    item.quantity,
            totalPrice:  item.price * item.quantity,
          })),
        },
      },
    });

    // Om Stripe inte är konfigurerat → direkt-order utan betalning
    if (!stripe) {
      await prisma.shopOrder.update({ where: { id: order.id }, data: { status: "pending" } });
      for (const item of lineItems) {
        await prisma.shopProduct.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        }).catch(() => {});
      }
      revalidatePath("/admin/butik/ordrar");
      return { success: true, orderId: order.id };
    }

    // Skapa Stripe Checkout Session
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const proto = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${proto}://${host}`;

    // Rabatt som Stripe-kupong så att kunden faktiskt debiteras rätt belopp.
    let discounts: Array<{ coupon: string }> | undefined;
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: "sek",
        duration: "once",
        name: discountCode ?? "Rabatt",
      });
      discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "sek",
          unit_amount: item.price, // öre
          product_data: { name: item.name },
        },
        quantity: item.quantity,
      })),
      ...(discounts ? { discounts } : {}),
      // Frakt som extra rad om det finns
      ...(shipping > 0 ? {
        shipping_options: [{
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shipping, currency: "sek" },
            display_name: "Standard frakt",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 4 },
            },
          },
        }],
      } : {}),
      metadata: { orderId: order.id, discountCode: discountCode ?? "" },
      success_url: `${baseUrl}/butik/kassa/bekraftelse?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/butik/varukorg`,
    });

    return { success: true, sessionUrl: session.url ?? undefined, orderId: order.id };
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return { success: false, error: "Något gick fel, försök igen." };
  }
}

export async function subscribeNewsletter(
  email: string,
  source = "shop"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Koppla till profil-id om inloggad
    let profileId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });
        profileId = profile?.id ?? null;
      }
    } catch { /* anonym */ }

    await prisma.shopNewsletterSubscriber.upsert({
      where: { email },
      update: {
        isActive: true,
        ...(profileId ? { userId: profileId } : {}),
      },
      create: {
        email,
        source,
        ...(profileId ? { userId: profileId } : {}),
      },
    });
    return { success: true };
  } catch (err) {
    console.error("subscribeNewsletter error:", err);
    return { success: false, error: "Kunde inte registrera e-posten." };
  }
}

export async function validateDiscount(
  code: string,
  orderTotal: number,
  cartItems?: Array<{ productId: string; price: number; quantity: number }>
): Promise<{ success: boolean; discountAmount?: number; type?: string; error?: string }> {
  try {
    const discount = await prisma.shopDiscountCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!discount || !discount.isActive) return { success: false, error: "Rabattkoden är ogiltig." };
    if (discount.endsAt && discount.endsAt < new Date()) return { success: false, error: "Rabattkoden har gått ut." };
    if (discount.startsAt && discount.startsAt > new Date()) return { success: false, error: "Rabattkoden är inte aktiv ännu." };
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return { success: false, error: "Rabattkoden har nått maxgränsen." };
    }
    if (discount.minOrderAmount !== null && orderTotal < discount.minOrderAmount) {
      return { success: false, error: `Minsta ordersumma för denna kod är ${discount.minOrderAmount / 100} kr.` };
    }

    // Kolla om koden utesluter nedsatta produkter
    if (discount.excludeSaleProducts && cartItems && cartItems.length > 0) {
      const productIds = cartItems.map((i) => i.productId).filter(Boolean);
      if (productIds.length > 0) {
        const saleProducts = await prisma.shopProduct
          .findMany({
            where: { id: { in: productIds }, compareAtPrice: { not: null } },
            select: { id: true },
          })
          .catch(() => []);
        if (saleProducts.length > 0) {
          return { success: false, error: "Denna rabattkod gäller inte på redan nedsatta produkter." };
        }
      }
    }

    let discountAmount = 0;
    if (discount.discountType === "percent") {
      discountAmount = Math.round(orderTotal * (discount.discountValue / 100));
    } else {
      discountAmount = Math.min(discount.discountValue, orderTotal);
    }
    return { success: true, discountAmount, type: discount.discountType };
  } catch (err) {
    console.error("validateDiscount error:", err);
    return { success: false, error: "Kunde inte validera rabattkoden." };
  }
}
