import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orderbekräftelse – Butik | Minodling" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [order, navUser] = await Promise.all([
    prisma.shopOrder.findUnique({
      where: { id },
      include: { items: true },
    }),
    getNavUser(user?.id),
  ]);

  if (!order) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50 py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Tack för din beställning!</h1>
            <p className="text-gray-600 mt-2">
              Din order <span className="font-semibold">{order.orderNumber}</span> har tagits emot.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              En bekräftelse skickas till {order.email}
            </p>
          </div>

          <Card padding="lg" className="mb-5">
            <h2 className="font-bold text-gray-900 mb-4">Beställningsdetaljer</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5">
              <div>
                <p className="text-gray-500">Ordernummer</p>
                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Datum</p>
                <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <Badge variant="warning" dot>{order.status}</Badge>
              </div>
              <div>
                <p className="text-gray-500">Betalning</p>
                <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"} dot>
                  {order.paymentStatus === "paid" ? "Betald" : "Väntar"}
                </Badge>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">Leveransadress</h3>
            <p className="text-sm text-gray-600">
              {order.firstName} {order.lastName}<br />
              {order.address}<br />
              {order.postalCode} {order.city}
            </p>
          </Card>

          <Card padding="none" className="mb-5">
            <div className="p-5 border-b border-sage-100">
              <h2 className="font-bold text-gray-900">Beställda varor</h2>
            </div>
            <div className="divide-y divide-sage-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-400 text-xs">Antal: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-sage-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delsumma</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frakt</span>
                <span>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Rabatt ({order.discountCode})</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-sage-100 pt-2">
                <span>Totalt</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/butik"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Fortsätt handla
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
