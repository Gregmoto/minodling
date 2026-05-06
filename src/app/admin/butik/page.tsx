export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Package, Receipt, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Butik – Översikt | Admin" };

export default async function AdminButikPage() {
  await requireAdmin();

  const [orderCount, revenueAgg, pendingCount, productCount, recentOrders] = await Promise.all([
    prisma.shopOrder.count(),
    prisma.shopOrder.aggregate({ _sum: { totalAmount: true } }),
    prisma.shopOrder.count({ where: { status: "pending" } }),
    prisma.shopProduct.count({ where: { isActive: true } }),
    prisma.shopOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, fullName: true,
        email: true, totalAmount: true, status: true, createdAt: true,
      },
    }),
  ]);

  const stats = [
    { label: "Totala ordrar", value: orderCount, icon: Receipt, color: "text-blue-600 bg-blue-50" },
    { label: "Total omsättning", value: formatPrice(revenueAgg._sum.totalAmount ?? 0), icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Väntande ordrar", value: pendingCount, icon: ShoppingBag, color: "text-amber-600 bg-amber-50" },
    { label: "Aktiva produkter", value: productCount, icon: Package, color: "text-purple-600 bg-purple-50" },
  ];

  function statusBadge(status: string) {
    const map: Record<string, "success" | "warning" | "danger" | "default"> = {
      completed: "success", pending: "warning", cancelled: "danger",
    };
    return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Butik – Översikt</h1>
        <p className="text-gray-500 text-sm mt-1">Statistik och senaste ordrar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Snabbåtkomst */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Produkter", href: "/admin/butik/produkter" },
          { label: "Kategorier", href: "/admin/butik/kategorier" },
          { label: "Ordrar", href: "/admin/butik/ordrar" },
          { label: "Kunder", href: "/admin/butik/kunder" },
          { label: "Rabattkoder", href: "/admin/butik/rabattkoder" },
          { label: "Nyhetsbrev", href: "/admin/butik/nyhetsbrev" },
          { label: "Inställningar", href: "/admin/butik/installningar" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Senaste ordrar */}
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Senaste ordrar</h2>
          <Link href="/admin/butik/ordrar" className="text-sm text-green-700 hover:underline">
            Visa alla
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kund</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Belopp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/butik/ordrar/${order.id}`} className="font-medium text-green-700 hover:underline">
                      {order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.fullName}</p>
                    <p className="text-gray-400 text-xs">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">{statusBadge(order.status)}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Inga ordrar ännu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
