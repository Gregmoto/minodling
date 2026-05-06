export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Ordrar | Butik | Admin" };

const ALL_STATUSES = [
  { value: "",                label: "Alla" },
  { value: "pending_payment", label: "Väntar betalning" },
  { value: "pending",         label: "Mottagen" },
  { value: "processing",      label: "Behandlas" },
  { value: "shipped",         label: "Skickad" },
  { value: "completed",       label: "Avslutad" },
  { value: "paid",            label: "Betald" },
  { value: "cancelled",       label: "Avbruten" },
  { value: "refunded",        label: "Återbetald" },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  completed: "success", paid: "success",
  pending: "warning", pending_payment: "warning",
  cancelled: "danger",
  processing: "info",
  shipped: "default", refunded: "default",
};

export default async function AdminOrdrarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; sida?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const statusFilter = sp.status ?? "";
  const query        = (sp.q ?? "").trim();
  const page         = Math.max(1, parseInt(sp.sida ?? "1") || 1);
  const perPage      = 30;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: "insensitive" } },
      { email:    { contains: query, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.shopOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true, fullName: true, email: true,
        totalAmount: true, status: true, createdAt: true,
        discountAmount: true, shippingAmount: true,
      },
    }).catch(() => []),
    prisma.shopOrder.count({ where }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / perPage);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (query)        p.set("q",      query);
    if (page > 1)     p.set("sida",   String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    const str = p.toString();
    return `/admin/butik/ordrar${str ? `?${str}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ordrar</h1>
        <p className="text-gray-500 text-sm mt-1">{total} ordrar totalt</p>
      </div>

      {/* Sök */}
      <form method="GET" action="/admin/butik/ordrar" className="relative max-w-sm">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Sök ordernr, namn eller e-post…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
      </form>

      {/* Statusfilter */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={buildUrl({ status: s.value, sida: "1" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s.value
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {s.label}
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
                    <Link href={`/admin/butik/ordrar/${order.id}`} className="font-mono text-xs font-semibold text-green-700 hover:underline">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.fullName}</p>
                    <p className="text-gray-400 text-xs">{order.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
                    {order.discountAmount > 0 && (
                      <p className="text-xs text-green-600">–{formatPrice(order.discountAmount)} rabatt</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[order.status] ?? "default"} size="sm">
                      {ALL_STATUSES.find(s => s.value === order.status)?.label ?? order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    {query ? `Inga ordrar matchar "${query}".` : "Inga ordrar hittades."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginering */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
            <span className="text-gray-500">Sida {page} av {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildUrl({ sida: String(page - 1) })}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium">
                  Föregående
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildUrl({ sida: String(page + 1) })}
                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-xs font-medium">
                  Nästa
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
