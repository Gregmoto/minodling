export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"} size="md">
            {order.paymentStatus === "paid" ? "Betald" : "Obetald"}
          </Badge>
        </div>
      </div>

      {/* Kundinfo */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Kundinformation</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Namn</p>
            <p className="font-medium text-gray-900">{order.firstName} {order.lastName}</p>
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
              {order.address}, {order.postalCode} {order.city}
            </p>
          </div>
        </div>
        {order.notes && (
          <div className="mt-3 pt-3 border-t border-sage-100">
            <p className="text-gray-500 text-sm">Anteckningar</p>
            <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
          </div>
        )}
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
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                <p className="text-gray-500 text-xs">Antal: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="font-semibold text-gray-900">{formatPrice(item.total)}</p>
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
            <span>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Rabatt {order.discountCode && `(${order.discountCode})`}</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-sage-100 pt-2">
            <span>Totalt</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
