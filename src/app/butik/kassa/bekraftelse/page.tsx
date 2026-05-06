import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Truck, Mail } from "lucide-react";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { ShopNavbarServer } from "@/components/shop/ShopNavbarServer";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Orderbekräftelse – Minodling Butik" };

interface PageProps {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}

export default async function BekraftelsePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sessionId = sp.session_id;
  const orderId   = sp.order_id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const navUser = await getNavUser(user?.id);

  let order = null;

  // Hämta order – verifiera via Stripe om session_id finns
  if (orderId) {
    order = await prisma.shopOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    }).catch(() => null);

    // Uppdatera status om Stripe-session är betald (och inte redan uppdaterad av webhook)
    if (order && sessionId && stripe && order.status === "pending_payment") {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          order = await prisma.shopOrder.update({
            where: { id: orderId },
            data: {
              status: "paid",
              stripeCheckoutSessionId: sessionId,
              stripePaymentIntentId: typeof session.payment_intent === "string"
                ? session.payment_intent : null,
            },
            include: { items: true },
          });
          // Minska lager
          for (const item of order.items) {
            if (item.productId) {
              await prisma.shopProduct.update({
                where: { id: item.productId },
                data: { stockQuantity: { decrement: item.quantity } },
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error("Could not verify Stripe session:", err);
      }
    }
  }

  const addr = order?.shippingAddress as { address?: string; city?: string; postalCode?: string } | null;

  return (
    <div className="flex min-h-screen flex-col">
      <ShopNavbarServer user={navUser} />

      <main className="flex-1 bg-cream-50 py-10 sm:py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">

          {/* Success-ikon */}
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Tack för din beställning!
            </h1>
            {order && (
              <p className="text-gray-600 mt-2">
                Order <span className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span> har tagits emot.
              </p>
            )}
            {order?.email && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                Bekräftelse skickas till {order.email}
              </div>
            )}
          </div>

          {order ? (
            <div className="space-y-4">
              {/* Orderdetaljer */}
              <Card padding="lg">
                <h2 className="font-bold text-gray-900 mb-4">Beställningsdetaljer</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Ordernummer</p>
                    <p className="font-bold text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Datum</p>
                    <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Status</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      order.status === "paid" ? "bg-green-100 text-green-700" :
                      order.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {order.status === "paid" ? "✓ Betald" :
                       order.status === "pending_payment" ? "⏳ Väntar på betalning" :
                       order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Betalning</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                {addr && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      <Truck className="h-3.5 w-3.5" /> Leveransadress
                    </div>
                    <p className="text-sm text-gray-700">
                      {order.fullName}<br />
                      {addr.address}<br />
                      {addr.postalCode} {addr.city}
                    </p>
                  </div>
                )}
              </Card>

              {/* Beställda varor */}
              <Card padding="none">
                <div className="px-5 py-4 border-b border-sage-100">
                  <h2 className="font-bold text-gray-900">Beställda varor</h2>
                </div>
                <div className="divide-y divide-sage-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center px-5 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-gray-400 text-xs">
                          {item.quantity} st × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-sage-100 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Delsumma</span><span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Rabatt</span><span>–{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Frakt</span>
                    <span>{order.shippingAmount === 0 ? "Gratis" : formatPrice(order.shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-sage-100 pt-2">
                    <span>Totalt</span><span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card padding="lg">
              <p className="text-gray-500 text-sm text-center">
                Din beställning behandlas. Du får ett bekräftelsemail inom kort.
              </p>
            </Card>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/butik"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" /> Fortsätt handla
            </Link>
            {user && (
              <Link
                href="/min-sida"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Min sida
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
