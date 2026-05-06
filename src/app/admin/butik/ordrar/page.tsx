export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Ordrar | Butik | Admin" };

const STATUS_OPTIONS = ["", "pending", "processing", "shipped", "completed", "cancelled"];

export default async function AdminOrdrarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const statusFilter = params.status ?? "";

  const orders = await prisma.shopOrder.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    orderBy: { createdAt: "desc" },
    select: {
      id: true, fullName: true, email: true,
      totalAmount: true, status: true, createdAt: true,
    },
  });

  function statusBadge(status: string) {
    const map: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
      completed: "success", pending: "warning", cancelled: "danger", processing: "info", shipped: "default",
    };
    return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ordrar</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} ordrar</p>
      </div>

      {/* Statusfilter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={s ? `/admin/butik/ordrar?status=${s}` : "/admin/butik/ordrar"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {s === "" ? "Alla" : s}
          </Link>
        ))}
      </div>

      <Card padding="none">
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
              {orders.map((order) => (
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
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Inga ordrar hittades.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
