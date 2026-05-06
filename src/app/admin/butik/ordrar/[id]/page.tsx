export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, CreditCard, Tag, User } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusForm } from "./OrderStatusForm";

export const metadata: Metadata = { title: "Orderdetaljer | Butik | Admin" };

const STATUS_LABELS: Record<string, string> = {
  paid: "Betald", pending: "Mottagen", processing: "Behandlas",
  shipped: "Skickad", completed: "Avslutad", cancelled: "Avbruten",
  pending_payment: "Väntar betalning", refunded: "Återbetald",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  completed: "success", paid: "success",
  pending: "warning", pending_payment: "warning",
  cancelled: "danger", processing: "info",
  shipped: "default", refunded: "default",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.shopOrder.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true, name: true } } } } },
  });

  if (!order) notFound();

  // Försök hitta profil via e-post eller userId
  const linkedProfile = await prisma.profile.findFirst({
    where: order.userId ? { id: order.userId } : { email: order.email },
    select: { id: true, username: true, fullName: true, email: true, userId: true },
  }).catch(() => null);

  // Försök hitta rabattkod
  const discountCode = order.discountAmount > 0
    ? await prisma.shopDiscountCode.findFirst({
        where: { discountValue: { gt: 0 }, isActive: true },
        // Vi har inte sparat koden per order, men vi visar om det finns rabatt
        select: { code: true, discountType: true, discountValue: true },
      }).catch(() => null)
    : null;

  const addr = order.shippingAddress as { address?: string; city?: string; postalCode?: string; country?: string } | null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</h1>
            <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <Link href="/admin/butik/ordrar" className="text-sm text-gray-500 hover:text-gray-700">
          ← Tillbaka till ordrar
        </Link>
      </div>

      {/* Kundinformation */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Kundinformation</h2>
          {linkedProfile && (
            <Link
              href={`/admin/anvandare/${linkedProfile.userId}`}
              className="flex items-center gap-1.5 text-xs text-green-700 hover:underline"
            >
              <User className="h-3.5 w-3.5" />
              Visa profil
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Namn</p>
            <p className="font-medium text-gray-900">{order.fullName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">E-post</p>
            <p className="font-medium text-gray-900">{order.email}</p>
          </div>
          {order.phone && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Telefon</p>
              <p className="font-medium text-gray-900">{order.phone}</p>
            </div>
          )}
          {addr && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Leveransadress</p>
              <p className="font-medium text-gray-900">
                {addr.address}<br />
                {addr.postalCode} {addr.city}
              </p>
            </div>
          )}
        </div>
        {linkedProfile && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <User className="h-3.5 w-3.5" />
            Registrerad kund: <span className="font-medium text-gray-700">{linkedProfile.fullName ?? linkedProfile.username}</span>
          </div>
        )}
      </Card>

      {/* Betalning & Stripe */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Betalningsinformation</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Totalt</p>
            <p className="font-bold text-gray-900 text-lg">{formatPrice(order.totalAmount)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Status</p>
            <Badge variant={STATUS_VARIANT[order.status] ?? "default"} size="sm">
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>

          {order.stripeCheckoutSessionId && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Stripe Session
              </p>
              <a
                href={`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-green-700 hover:underline flex items-center gap-1 break-all"
              >
                {order.stripeCheckoutSessionId.slice(0, 24)}…
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}

          {order.stripePaymentIntentId && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Payment Intent
              </p>
              <a
                href={`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-green-700 hover:underline flex items-center gap-1 break-all"
              >
                {order.stripePaymentIntentId}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}

          {order.discountAmount > 0 && (
            <div className="col-span-2">
              <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Rabatt
              </p>
              <p className="text-green-700 font-semibold text-sm">
                –{formatPrice(order.discountAmount)}
                {discountCode && <span className="ml-2 text-xs text-gray-500 font-normal">(rabattkod använd)</span>}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Orderstatus */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Uppdatera status</h2>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </Card>

      {/* Varor */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Beställda varor</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">
                  {item.product?.slug ? (
                    <Link href={`/butik/produkt/${item.product.slug}`} target="_blank"
                      className="hover:text-green-700 hover:underline flex items-center gap-1">
                      {item.productName}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : item.productName}
                </p>
                <p className="text-gray-500 text-xs">
                  {item.quantity} st × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Delsumma</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Rabatt</span>
              <span>–{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Frakt</span>
            <span>{order.shippingAmount === 0 ? "Gratis" : formatPrice(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
            <span>Totalt</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Teknisk info */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Teknisk information</h2>
        <div className="space-y-1 text-xs text-gray-500 font-mono">
          <div className="flex gap-3">
            <span className="text-gray-400 w-28 shrink-0">Order ID</span>
            <span className="text-gray-700 break-all">{order.id}</span>
          </div>
          {order.userId && (
            <div className="flex gap-3">
              <span className="text-gray-400 w-28 shrink-0">User (profile)</span>
              <span className="text-gray-700 break-all">{order.userId}</span>
            </div>
          )}
          {order.stripeCheckoutSessionId && (
            <div className="flex gap-3">
              <span className="text-gray-400 w-28 shrink-0">Stripe Session</span>
              <span className="text-gray-700 break-all">{order.stripeCheckoutSessionId}</span>
            </div>
          )}
          {order.stripePaymentIntentId && (
            <div className="flex gap-3">
              <span className="text-gray-400 w-28 shrink-0">Payment Intent</span>
              <span className="text-gray-700 break-all">{order.stripePaymentIntentId}</span>
            </div>
          )}
          <div className="flex gap-3">
            <span className="text-gray-400 w-28 shrink-0">Skapad</span>
            <span className="text-gray-700">{order.createdAt.toISOString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
