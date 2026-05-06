import { NextRequest, NextResponse } from "next/server";
import { stripe, getWebhookSecret } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email";
import { awardOrderPoints } from "@/lib/loyalty";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";
  const secret = getWebhookSecret();

  if (!secret || secret === "whsec_your_secret") {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await prisma.shopOrder.update({
          where: { id: orderId },
          data: {
            status: "paid",
            stripePaymentIntentId: typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
            stripeCheckoutSessionId: session.id,
          },
        });

        // Minska lager (om inte redan gjort)
        const order = await prisma.shopOrder.findUnique({
          where: { id: orderId },
          include: {
            items: true,
            profile: { select: { id: true } },
          },
        });
        if (order?.status === "paid") {
          for (const item of order.items) {
            if (item.productId) {
              await prisma.shopProduct.update({
                where: { id: item.productId },
                data: { stockQuantity: { decrement: item.quantity } },
              }).catch(() => {/* ignore if product deleted */});
            }
          }

          // Skicka orderbekräftelse och adminnotis
          await sendOrderConfirmation({
            to: order.email,
            fullName: order.fullName,
            orderId: order.id,
            items: order.items,
            subtotal: order.subtotal,
            shippingAmount: order.shippingAmount,
            discountAmount: order.discountAmount,
            totalAmount: order.totalAmount,
          }).catch(() => {});
          await sendAdminOrderNotification(order.id, order.email, order.fullName, order.totalAmount).catch(() => {});

          // Tilldela lojalitetspoäng
          if (order.profile?.id) {
            await awardOrderPoints(order.profile.id, order.id, order.totalAmount).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Failed to update order from webhook:", err);
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.shopOrder.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
