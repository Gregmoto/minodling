export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/shop/StarRating";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Omdömen | Butik | Admin" };

const ALL_STATUSES = [
  { value: "",         label: "Alla" },
  { value: "pending",  label: "Väntar" },
  { value: "approved", label: "Godkänd" },
  { value: "rejected", label: "Nekad" },
  { value: "hidden",   label: "Dold" },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "default" | "info"> = {
  approved: "success",
  pending:  "warning",
  rejected: "danger",
  hidden:   "default",
};

const statusLabel: Record<string, string> = {
  approved: "Godkänd",
  pending:  "Väntar",
  rejected: "Nekad",
  hidden:   "Dold",
};

interface PageProps {
  searchParams: Promise<{ status?: string; product?: string; q?: string; sida?: string }>;
}

export default async function AdminOmdomenPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const statusFilter  = sp.status ?? "";
  const productFilter = sp.product ?? "";
  const query         = (sp.q ?? "").trim();
  const page          = Math.max(1, parseInt(sp.sida ?? "1") || 1);
  const perPage       = 30;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (statusFilter)  where.status    = statusFilter;
  if (productFilter) where.productId = productFilter;
  if (query) {
    where.OR = [
      { title:   { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { product: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const [reviews, total, products] = await Promise.all([
    prisma.shopProductReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true, rating: true, title: true, status: true, createdAt: true,
        isVerifiedPurchase: true,
        product: { select: { id: true, name: true, slug: true } },
        user:    { select: { username: true, fullName: true } },
      },
    }).catch(() => []),
    prisma.shopProductReview.count({ where }).catch(() => 0),
    prisma.shopProduct.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  const totalPages = Math.ceil(total / perPage);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter)  p.set("status",   statusFilter);
    if (productFilter) p.set("product",  productFilter);
    if (query)         p.set("q",        query);
    if (page > 1)      p.set("sida",     String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    const str = p.toString();
    return `/admin/butik/omdomen${str ? `?${str}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Omdömen</h1>
        <p className="text-gray-500 text-sm mt-1">{total} omdömen totalt</p>
      </div>

      {/* Sök */}
      <div className="flex flex-wrap gap-3">
        <form method="GET" action="/admin/butik/omdomen" className="relative max-w-sm flex-1 min-w-[200px]">
          {statusFilter  && <input type="hidden" name="status"  value={statusFilter} />}
          {productFilter && <input type="hidden" name="product" value={productFilter} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Sök titel, innehåll eller produkt…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </form>

        {/* Produktfilter */}
        <form method="GET" action="/admin/butik/omdomen">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {query        && <input type="hidden" name="q"      value={query} />}
          <select
            name="product"
            defaultValue={productFilter}
            onChange={(e) => {
              const form = e.currentTarget.closest("form") as HTMLFormElement;
              form?.submit();
            }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          >
            <option value="">Alla produkter</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </form>
      </div>

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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Produkt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Betyg</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/butik/produkt/${review.product.slug}`}
                      target="_blank"
                      className="text-xs font-medium text-green-700 hover:underline"
                    >
                      {review.product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 text-xs">
                      {review.user?.fullName ?? review.user?.username ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={review.rating} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 text-xs max-w-[160px] truncate">
                      {review.title ?? <span className="text-gray-400 italic">Ingen rubrik</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[review.status] ?? "default"} size="xs">
                      {statusLabel[review.status] ?? review.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/butik/omdomen/${review.id}`}
                      className="text-xs font-medium text-green-700 hover:underline"
                    >
                      Granska →
                    </Link>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Inga omdömen hittades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
