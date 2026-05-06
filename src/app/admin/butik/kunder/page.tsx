export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Search, User } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Kunder | Butik | Admin" };

interface CustomerRow {
  email: string;
  fullName: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: Date;
  profileId: string | null;
  profileUsername: string | null;
}

export default async function AdminKunderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sida?: string }>;
}) {
  await requireAdmin();
  const sp    = await searchParams;
  const query = (sp.q ?? "").trim();
  const page  = Math.max(1, parseInt(sp.sida ?? "1") || 1);
  const perPage = 30;

  // Hämta alla unika kunder från ordrar (grupperat på e-post)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereOrder: any = {};
  if (query) {
    whereOrder.OR = [
      { fullName: { contains: query, mode: "insensitive" } },
      { email:    { contains: query, mode: "insensitive" } },
    ];
  }

  // Hämta ordrar för att bygga kundlistan
  const allOrders = await prisma.shopOrder.findMany({
    where: whereOrder,
    select: {
      email: true,
      fullName: true,
      totalAmount: true,
      createdAt: true,
      userId: true,
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  // Gruppera per e-post
  const customerMap = new Map<string, CustomerRow>();
  for (const order of allOrders) {
    const existing = customerMap.get(order.email);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += order.totalAmount;
      if (order.createdAt > existing.lastOrder) {
        existing.lastOrder = order.createdAt;
        existing.fullName  = order.fullName; // Använd senaste namn
      }
    } else {
      customerMap.set(order.email, {
        email: order.email,
        fullName: order.fullName,
        orderCount: 1,
        totalSpent: order.totalAmount,
        lastOrder: order.createdAt,
        profileId: order.userId,
        profileUsername: null,
      });
    }
  }

  // Hämta profil-info för kunder som har konton
  const profileIds = [...customerMap.values()]
    .map(c => c.profileId)
    .filter(Boolean) as string[];

  if (profileIds.length > 0) {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: profileIds } },
      select: { id: true, username: true, userId: true },
    }).catch(() => []);

    for (const profile of profiles) {
      for (const customer of customerMap.values()) {
        if (customer.profileId === profile.id) {
          customer.profileUsername = profile.username;
        }
      }
    }
  }

  // Koppla också via e-post (gäster som sedan registrerade sig)
  const emailsWithoutProfile = [...customerMap.values()]
    .filter(c => !c.profileId)
    .map(c => c.email);

  if (emailsWithoutProfile.length > 0) {
    const profilesByEmail = await prisma.profile.findMany({
      where: { email: { in: emailsWithoutProfile } },
      select: { id: true, username: true, email: true, userId: true },
    }).catch(() => []);

    for (const profile of profilesByEmail) {
      const customer = customerMap.get(profile.email ?? "");
      if (customer && !customer.profileId) {
        customer.profileId = profile.id;
        customer.profileUsername = profile.username;
      }
    }
  }

  // Sortera: flest ordrar och mest spenderat
  const customers = [...customerMap.values()].sort((a, b) => {
    if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
    return b.totalSpent - a.totalSpent;
  });

  const total     = customers.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated  = customers.slice((page - 1) * perPage, page * perPage);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (page > 1) p.set("sida", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    const str = p.toString();
    return `/admin/butik/kunder${str ? `?${str}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kunder</h1>
        <p className="text-gray-500 text-sm mt-1">{total} unika kunder (baserat på ordrar)</p>
      </div>

      {/* Sök */}
      <form method="GET" action="/admin/butik/kunder" className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Sök namn eller e-post…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
      </form>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kund</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Konto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-right">Ordrar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-right">Totalt spenderat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Senaste order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((c) => (
                <tr key={c.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.fullName}</p>
                    <p className="text-gray-400 text-xs">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.profileId ? (
                      <Link
                        href={`/admin/anvandare`}
                        className="flex items-center gap-1.5 text-xs text-green-700 hover:underline"
                      >
                        <User className="h-3.5 w-3.5" />
                        {c.profileUsername ?? "Registrerad"}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">Gäst</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">{c.orderCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">{formatPrice(c.totalSpent)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(c.lastOrder)}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    {query ? `Inga kunder matchar "${query}".` : "Inga kunder ännu."}
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
