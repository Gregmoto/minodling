import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Truck, Mail, Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { ShopNavbarServer } from "@/components/shop/ShopNavbarServer";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orderdetaljer – Butik | Minodling" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment:  { label: "⏳ Väntar på betalning", color: "bg-amber-100 text-amber-700" },
  pending:          { label: "📋 Mottagen",             color: "bg-blue-100 text-blue-700" },
  processing:       { label: "⚙️ Behandlas",            color: "bg-purple-100 text-purple-700" },
  shipped:          { label: "🚚 Skickad",              color: "bg-indigo-100 text-indigo-700" },
  completed:        { label: "✓ Avslutad",              color: "bg-green-100 text-green-700" },
  paid:             { label: "✓ Betald",                color: "bg-green-100 text-green-700" },
  cancelled:        { label: "✗ Avbruten",              color: "bg-red-100 text-red-700" },
  refunded:         { label: "↩ Återbetald",            color: "bg-gray-100 text-gray-700" },
};

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [order, navUser] = await Promise.all([
    prisma.shopOrder.findUnique({
      where: { id },
      include: { items: { include: { product: { select: { slug: true } } } } },
    }).catch(() => null),
    getNavUser(user?.id),
  ]);

  if (!order) notFound();

  // Auth check: user must own order, be admin, or have valid guest token
  const isAdmin = navUser?.role === "admin" || navUser?.role === "moderator";

  if (!isAdmin) {
    if (user) {
      // Inloggad: kontrollera att ordern tillhör profilen
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }).catch(() => null);
      if (!profile || order.userId !== profile.id) notFound();
    } else {
      // Gäst: kontrollera guest-token (order-id sista 12 tecken används som token)
      const expectedToken = order.id.slice(-12);
      if (token !== expectedToken) notFound();
    }
  }

  const addr = order.shippingAddress as { address?: string; city?: string; postalCode?: string; country?: string } | null;
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopNavbarServer user={navUser} />

      <main className="flex-1 bg-cream-50 py-10 sm:py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Din beställning</h1>
            <p className="text-gray-600 mt-2">
              Order <span className="font-semibold font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
            </p>
            {order.email && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                {order.email}
              </div>
            )}
          </div>

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
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
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
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-sage-50 border border-sage-100 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-sage-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.product?.slug ? (
                          <Link href={`/butik/produkt/${item.product.slug}`} className="hover:text-green-700 hover:underline">
                            {item.productName}
                          </Link>
                        ) : item.productName}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {item.quantity} st × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 shrink-0">{formatPrice(item.totalPrice)}</p>
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
