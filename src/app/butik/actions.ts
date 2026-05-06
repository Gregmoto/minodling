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

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MIN-${date}-${rand}`;
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

    const firstName = (formData.get("firstName") as string).trim();
    const lastName = (formData.get("lastName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone = (formData.get("phone") as string | null)?.trim() ?? null;
    const address = (formData.get("address") as string).trim();
    const city = (formData.get("city") as string).trim();
    const postalCode = (formData.get("postalCode") as string).trim();
    const notes = (formData.get("notes") as string | null)?.trim() ?? null;
    const shippingCost = Number(formData.get("shippingCost") ?? 0);

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + shippingCost;

    // Verify stock and build items
    for (const item of cartItems) {
      const product = await prisma.shopProduct.findUnique({
        where: { id: item.productId },
        select: { stock: true, isActive: true },
      });
      if (!product || !product.isActive) {
        return { success: false, error: `Produkten "${item.name}" är inte tillgänglig.` };
      }
      if (product.stock < item.quantity) {
        return { success: false, error: `Otillräckligt lager för "${item.name}".` };
      }
    }

    let orderNumber = generateOrderNumber();
    // Ensure unique
    let attempts = 0;
    while (await prisma.shopOrder.findUnique({ where: { orderNumber } }) && attempts < 5) {
      orderNumber = generateOrderNumber();
      attempts++;
    }

    const order = await prisma.shopOrder.create({
      data: {
        orderNumber,
        userId: profile.id,
        email,
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
        subtotal,
        shippingCost,
        total,
        notes,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        },
      },
    });

    // Decrement stock
    for (const item of cartItems) {
      await prisma.shopProduct.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
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
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.shopNewsletter.upsert({
      where: { email },
      update: { isActive: true, firstName: firstName ?? null },
      create: { email, firstName: firstName ?? null, source: "shop" },
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
    const discount = await prisma.shopDiscount.findUnique({ where: { code: code.toUpperCase() } });
    if (!discount || !discount.isActive) {
      return { success: false, error: "Rabattkoden är ogiltig." };
    }
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return { success: false, error: "Rabattkoden har gått ut." };
    }
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return { success: false, error: "Rabattkoden har nått maxgränsen." };
    }
    if (discount.minOrder !== null && orderTotal < discount.minOrder) {
      return { success: false, error: `Minsta ordersumma för denna kod är ${discount.minOrder / 100} kr.` };
    }

    let discountAmount = 0;
    if (discount.type === "percent") {
      discountAmount = Math.round(orderTotal * (discount.value / 100));
    } else {
      discountAmount = discount.value;
    }

    return { success: true, discountAmount, type: discount.type };
  } catch (err) {
    console.error("validateDiscount error:", err);
    return { success: false, error: "Kunde inte validera rabattkoden." };
  }
}
