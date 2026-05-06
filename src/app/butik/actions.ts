"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

interface CartItemData {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

export async function createOrder(
  formData: FormData
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Du måste vara inloggad för att beställa." };

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { success: false, error: "Profil hittades inte." };

    const cartItemsJson = formData.get("cartItems") as string;
    const cartItems: CartItemData[] = JSON.parse(cartItemsJson);
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Varukorgen är tom." };
    }

    const fullName = (formData.get("fullName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone = (formData.get("phone") as string | null)?.trim() ?? null;
    const address = (formData.get("address") as string).trim();
    const city = (formData.get("city") as string).trim();
    const postalCode = (formData.get("postalCode") as string).trim();
    const shippingAmount = Number(formData.get("shippingAmount") ?? 0);

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalAmount = subtotal + shippingAmount;

    // Verify stock and build items
    for (const item of cartItems) {
      const product = await prisma.shopProduct.findUnique({
        where: { id: item.productId },
        select: { stockQuantity: true, isActive: true },
      });
      if (!product || !product.isActive) {
        return { success: false, error: `Produkten "${item.name}" är inte tillgänglig.` };
      }
      if (product.stockQuantity < item.quantity) {
        return { success: false, error: `Otillräckligt lager för "${item.name}".` };
      }
    }

    const order = await prisma.shopOrder.create({
      data: {
        userId: profile.id,
        email,
        fullName,
        phone,
        shippingAddress: { address, city, postalCode, country: "SE" },
        subtotal,
        shippingAmount,
        totalAmount,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
          })),
        },
      },
    });

    // Decrement stock
    for (const item of cartItems) {
      await prisma.shopProduct.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    revalidatePath("/admin/butik/ordrar");
    return { success: true, orderId: order.id };
  } catch (err) {
    console.error("createOrder error:", err);
    return { success: false, error: "Något gick fel vid beställningen." };
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
  orderTotal: number
): Promise<{ success: boolean; discountAmount?: number; type?: string; error?: string }> {
  try {
    const discount = await prisma.shopDiscountCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!discount || !discount.isActive) {
      return { success: false, error: "Rabattkoden är ogiltig." };
    }
    if (discount.endsAt && discount.endsAt < new Date()) {
      return { success: false, error: "Rabattkoden har gått ut." };
    }
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return { success: false, error: "Rabattkoden har nått maxgränsen." };
    }
    if (discount.minOrderAmount !== null && orderTotal < discount.minOrderAmount) {
      return { success: false, error: `Minsta ordersumma för denna kod är ${discount.minOrderAmount / 100} kr.` };
    }

    let discountAmount = 0;
    if (discount.discountType === "percent") {
      discountAmount = Math.round(orderTotal * (discount.discountValue / 100));
    } else {
      discountAmount = discount.discountValue;
    }

    return { success: true, discountAmount, type: discount.discountType };
  } catch (err) {
    console.error("validateDiscount error:", err);
    return { success: false, error: "Kunde inte validera rabattkoden." };
  }
}
