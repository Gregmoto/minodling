export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag, Package, Receipt, TrendingUp, Users,
  Mail, Tag, AlertTriangle, ArrowRight, Star,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Butik – Översikt | Admin" };

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function AdminButikPage() {
  await requireAdmin();

  const now = new Date();
  const todayStart  = startOfDay(now);
  const monthStart  = startOfMonth(now);

  const [
    totalOrders, totalRevenue,
    todayOrders, todayRevenue,
    monthOrders, monthRevenue,
    pendingCount, processingCount,
    activeProducts, lowStockProducts,
    newsletterCount, activeDiscounts,
    recentOrders, topProducts,
    newCustomersMonth,
  ] = await Promise.all([
    safe(() => prisma.shopOrder.count(), 0),
    safe(() => prisma.shopOrder.aggregate({ _sum: { totalAmount: true } }), { _sum: { totalAmount: 0 } }),

    safe(() => prisma.shopOrder.count({ where: { createdAt: { gte: todayStart } } }), 0),
    safe(() => prisma.shopOrder.aggregate({
      where: { createdAt: { gte: todayStart }, status: { in: ["paid", "processing", "shipped", "completed"] } },
      _sum: { totalAmount: true },
    }), { _sum: { totalAmount: 0 } }),

    safe(() => prisma.shopOrder.count({ where: { createdAt: { gte: monthStart } } }), 0),
    safe(() => prisma.shopOrder.aggregate({
      where: { createdAt: { gte: monthStart }, status: { in: ["paid", "processing", "shipped", "completed"] } },
      _sum: { totalAmount: true },
    }), { _sum: { totalAmount: 0 } }),

    safe(() => prisma.shopOrder.count({ where: { status: "pending" } }), 0),
    safe(() => prisma.shopOrder.count({ where: { status: "processing" } }), 0),

    safe(() => prisma.shopProduct.count({ where: { isActive: true } }), 0),
    safe(() => prisma.shopProduct.findMany({
      where: { isActive: true, stockQuantity: { lte: 5 } },
      select: { id: true, name: true, slug: true, stockQuantity: true },
      orderBy: { stockQuantity: "asc" },
      take: 6,
    }), []),

    safe(() => prisma.shopNewsletterSubscriber.count({ where: { isActive: true } }), 0),
    safe(() => prisma.shopDiscountCode.count({ where: { isActive: true } }), 0),

    safe(() => prisma.shopOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, fullName: true, email: true, totalAmount: true, status: true, createdAt: true },
    }), []),

    safe(() => prisma.shopOrderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
      where: { productId: { not: null } },
    }), []),

    safe(() => prisma.shopOrder.groupBy({
      by: ["email"],
      where: { createdAt: { gte: monthStart } },
      _count: true,
    }), []),
  ]);

  const statusVariant: Record<string, "success" | "warning" | "danger" | "default" | "info"> = {
    completed: "success", paid: "success", pending: "warning", pending_payment: "warning",
    cancelled: "danger", processing: "info", shipped: "default", refunded: "default",
  };

  const STATUS_LABELS: Record<string, string> = {
    paid: "Betald", pending: "Mottagen", processing: "Behandlas",
    shipped: "Skickad", completed: "Avslutad", cancelled: "Avbruten",
    pending_payment: "Väntar betalning", refunded: "Återbetald",
  };

  const NAV_LINKS = [
    { label: "Startsida",     href: "/admin/butik/startsida",    color: "text-violet-700 bg-violet-50 border-violet-200" },
    { label: "Slides",        href: "/admin/butik/slides",       color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
    { label: "Produkter",     href: "/admin/butik/produkter",    color: "text-blue-700 bg-blue-50 border-blue-200" },
    { label: "Kategorier",    href: "/admin/butik/kategorier",   color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
    { label: "Ordrar",        href: "/admin/butik/ordrar",       color: "text-amber-700 bg-amber-50 border-amber-200" },
    { label: "Kunder",        href: "/admin/butik/kunder",       color: "text-purple-700 bg-purple-50 border-purple-200" },
    { label: "Rabattkoder",   href: "/admin/butik/rabattkoder",  color: "text-pink-700 bg-pink-50 border-pink-200" },
    { label: "Poäng",         href: "/admin/butik/poang",        color: "text-amber-700 bg-amber-50 border-amber-200" },
    { label: "Nyhetsbrev",    href: "/admin/butik/nyhetsbrev",   color: "text-teal-700 bg-teal-50 border-teal-200" },
    { label: "Inställningar", href: "/admin/butik/installningar",color: "text-gray-700 bg-gray-50 border-gray-200" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Butik – Översikt</h1>
        <p className="text-gray-500 text-sm mt-1">Statistik och senaste aktivitet</p>
      </div>

      {/* Snabblänkar */}
      <div className="flex flex-wrap gap-2">
        {NAV_LINKS.map((item) => (
          <Link key={item.href} href={item.href}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:opacity-80 ${item.color}`}>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Stats – idag & månad */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-xs text-gray-500 mb-1">Ordrar idag</p>
          <p className="text-2xl font-bold text-gray-900">{todayOrders}</p>
          <p className="text-xs text-green-700 mt-1 font-medium">{formatPrice(todayRevenue._sum.totalAmount ?? 0)}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-500 mb-1">Ordrar denna månad</p>
          <p className="text-2xl font-bold text-gray-900">{monthOrders}</p>
          <p className="text-xs text-green-700 mt-1 font-medium">{formatPrice(monthRevenue._sum.totalAmount ?? 0)}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-500 mb-1">Totalt ordrar</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-xs text-green-700 mt-1 font-medium">{formatPrice(totalRevenue._sum.totalAmount ?? 0)}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-500 mb-1">Nya kunder/månad</p>
          <p className="text-2xl font-bold text-gray-900">{newCustomersMonth.length}</p>
          <p className="text-xs text-gray-400 mt-1">unika e-poster</p>
        </Card>
      </div>

      {/* Status & övrigt */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Väntande ordrar",      value: pendingCount,    icon: Receipt,    color: "text-amber-600 bg-amber-50" },
          { label: "Under behandling",      value: processingCount, icon: ShoppingBag,color: "text-blue-600 bg-blue-50" },
          { label: "Aktiva produkter",      value: activeProducts,  icon: Package,    color: "text-purple-600 bg-purple-50" },
          { label: "Nyhetsbrevsprenumeranter", value: newsletterCount, icon: Mail,   color: "text-teal-600 bg-teal-50" },
          { label: "Aktiva rabattkoder",    value: activeDiscounts, icon: Tag,        color: "text-pink-600 bg-pink-50" },
          { label: "Lågt lager (≤5 st)",    value: lowStockProducts.length, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
          { label: "Stjärnprodukter",       value: topProducts.length, icon: Star,   color: "text-yellow-600 bg-yellow-50" },
          { label: "Totala kunder/månad",   value: `${newCustomersMonth.length} nya`, icon: Users, color: "text-green-600 bg-green-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.color} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500 leading-tight truncate">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Senaste ordrar */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Senaste ordrar</h2>
              <Link href="/admin/butik/ordrar" className="text-sm text-green-700 hover:underline flex items-center gap-1">
                Visa alla <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Order</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Kund</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Belopp</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/butik/ordrar/${order.id}`} className="font-mono text-xs font-medium text-green-700 hover:underline">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-900 text-xs">{order.fullName}</p>
                        <p className="text-gray-400 text-[11px]">{order.email}</p>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900 text-xs">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={statusVariant[order.status] ?? "default"} size="sm">
                          {STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                        Inga ordrar ännu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Höger kolumn */}
        <div className="space-y-4">
          {/* Topprodukter */}
          <Card padding="none">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Toppsäljare</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {topProducts.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400">Ingen data ännu.</p>
              ) : topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-gray-400 w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.productName}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700 shrink-0">{p._sum.quantity ?? 0} st</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Lågt lager */}
          {lowStockProducts.length > 0 && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2 rounded-t-xl">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h2 className="font-semibold text-red-700 text-sm">Lågt lager</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-2.5">
                    <Link href={`/admin/butik/produkter/${p.id}/redigera`}
                      className="text-sm text-gray-900 hover:text-green-700 hover:underline truncate flex-1 mr-3">
                      {p.name}
                    </Link>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.stockQuantity === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {p.stockQuantity === 0 ? "Slut" : `${p.stockQuantity} kvar`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100">
                <Link href="/admin/butik/produkter" className="text-xs text-green-700 hover:underline flex items-center gap-1">
                  Hantera produkter <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
