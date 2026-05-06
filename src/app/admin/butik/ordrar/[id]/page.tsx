export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusForm } from "./OrderStatusForm";

export const metadata: Metadata = { title: "Orderdetaljer | Butik | Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.shopOrder.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });

  if (!order) notFound();

  const addr = order.shippingAddress as { address: string; city: string; postalCode: string; country: string };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Kundinfo */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Kundinformation</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Namn</p>
            <p className="font-medium text-gray-900">{order.fullName}</p>
          </div>
          <div>
            <p className="text-gray-500">E-post</p>
            <p className="font-medium text-gray-900">{order.email}</p>
          </div>
          {order.phone && (
            <div>
              <p className="text-gray-500">Telefon</p>
              <p className="font-medium text-gray-900">{order.phone}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Adress</p>
            <p className="font-medium text-gray-900">
              {addr.address}, {addr.postalCode} {addr.city}
            </p>
          </div>
        </div>
      </Card>

      {/* Orderstatus */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Orderstatus</h2>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </Card>

      {/* Varor */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Varor</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-gray-500 text-xs">Antal: {item.quantity} × {formatPrice(item.unitPrice)}</p>
              </div>
              <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delsumma</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Frakt</span>
            <span>{order.shippingAmount === 0 ? "Gratis" : formatPrice(order.shippingAmount)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Rabatt</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-sage-100 pt-2">
            <span>Totalt</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
