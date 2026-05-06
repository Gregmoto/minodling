export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { Package, SlidersHorizontal } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ProductCard, ProductCardData } from "@/components/shop/ProductCard";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Alla produkter | Minodling Butik",
    description: "Bläddra bland alla produkter i Minodlings butik. Frön, jord och odlingstillbehör för svenska odlare.",
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/butik/produkter` },
  };
}

interface PageProps {
  searchParams: Promise<{
    sort?:     string;
    kategori?: string;
    sida?:     string;
    q?:        string;
  }>;
}

const PER_PAGE = 24;

const SORT_OPTIONS = [
  { value: "nyast",     label: "Nyast" },
  { value: "pris-asc",  label: "Lägst pris" },
  { value: "pris-hog",  label: "Högst pris" },
  { value: "popularast",label: "Populärast" },
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

function buildOrderBy(sort: SortValue) {
  switch (sort) {
    case "pris-asc":  return { price: "asc"  } as const;
    case "pris-hog":  return { price: "desc" } as const;
    default:          return { createdAt: "desc" } as const;
  }
}

export default async function ProdukterPage({ searchParams }: PageProps) {
  const params    = await searchParams;
  const sort      = (params.sort ?? "nyast") as SortValue;
  const kategori  = params.kategori ?? "";
  const q         = params.q?.trim() ?? "";
  const page      = Math.max(1, Number(params.sida ?? "1"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const where = {
    isActive: true,
    ...(kategori ? { category: { slug: kategori } } : {}),
    ...(q ? {
      OR: [
        { name:             { contains: q, mode: "insensitive" as const } },
        { shortDescription: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  // Populärast: hämta produkt-ids sorterade efter ordrar
  let popularIds: string[] = [];
  if (sort === "popularast") {
    const rows = await prisma.shopOrderItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
    }).catch(() => []);
    popularIds = rows.map((r) => r.productId).filter(Boolean) as string[];
  }

  const productSelect = {
    id: true, slug: true, name: true, shortDescription: true,
    price: true, compareAtPrice: true, imageUrl: true,
    stockQuantity: true, isFeatured: true, difficultyLevel: true, createdAt: true,
    category: { select: { name: true, slug: true } },
  } as const;

  const [totalCount, categories, navUser] = await Promise.all([
    prisma.shopProduct.count({ where }).catch(() => 0),
    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, _count: { select: { products: { where: { isActive: true } } } } },
    }).catch(() => []),
    getNavUser(user?.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const skip = (page - 1) * PER_PAGE;

  let products: ProductCardData[] = [];
  let popularSet: Set<string> = new Set();

  if (sort === "popularast" && popularIds.length > 0) {
    // Hämta alla matchande produkter och sortera efter popularIds
    const all = await prisma.shopProduct.findMany({
      where,
      select: productSelect,
    }).catch(() => []);

    popularSet = new Set(popularIds);
    const sorted = [
      ...popularIds.map((id) => all.find((p) => p.id === id)).filter(Boolean) as typeof all,
      ...all.filter((p) => !popularSet.has(p.id)),
    ];
    products = sorted.slice(skip, skip + PER_PAGE) as ProductCardData[];
  } else {
    products = await prisma.shopProduct.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip,
      take: PER_PAGE,
      select: productSelect,
    }).catch(() => []) as ProductCardData[];
  }

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (sort && sort !== "nyast") p.set("sort", sort);
    if (kategori) p.set("kategori", kategori);
    if (q)        p.set("q", q);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    const str = p.toString();
    return `/butik/produkter${str ? `?${str}` : ""}`;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero-header */}
        <section className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
          <div className="container-main">
            <Breadcrumbs
              items={[
                { name: "Butik",     href: "/butik" },
                { name: "Produkter", href: "/butik/produkter" },
              ]}
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Alla produkter</h1>
            <p className="mt-2 text-gray-500 max-w-xl">
              {totalCount} {totalCount === 1 ? "produkt" : "produkter"} i butiken
            </p>

            {/* Sök */}
            <form method="GET" action="/butik/produkter" className="mt-5 flex gap-2 max-w-md">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Sök produkt…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
              {kategori && <input type="hidden" name="kategori" value={kategori} />}
              {sort && sort !== "nyast" && <input type="hidden" name="sort" value={sort} />}
              <button type="submit" className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">
                Sök
              </button>
            </form>
          </div>
        </section>

        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── SIDEBAR ─────────────────────────────── */}
            <aside className="lg:w-56 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Kategorier */}
                <div>
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Kategori
                  </h2>
                  <div className="space-y-0.5">
                    <Link href={buildUrl({ kategori: "", sida: "" })}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        !kategori ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                      }`}>
                      Alla kategorier
                    </Link>
                    {categories.map((cat) => (
                      <Link key={cat.slug} href={buildUrl({ kategori: cat.slug, sida: "" })}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          kategori === cat.slug ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                        }`}>
                        <span>{cat.name}</span>
                        <span className={`text-xs ${kategori === cat.slug ? "text-white/70" : "text-gray-400"}`}>
                          {cat._count.products}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sortering */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Sortering</h2>
                  <div className="space-y-0.5">
                    {SORT_OPTIONS.map((opt) => (
                      <Link key={opt.value} href={buildUrl({ sort: opt.value, sida: "" })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          sort === opt.value ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                        }`}>
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Rensa */}
                {(q || kategori || sort !== "nyast") && (
                  <Link href="/butik/produkter" className="block text-sm text-gray-400 hover:text-red-500 transition-colors">
                    × Rensa filter
                  </Link>
                )}
              </div>
            </aside>

            {/* ── PRODUKTGRID ──────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Status + sortering (mobil) */}
              <div className="flex items-center justify-between mb-5 gap-3">
                <p className="text-sm text-gray-500">
                  {totalCount === 0
                    ? "Inga produkter hittades"
                    : `Visar ${skip + 1}–${Math.min(skip + PER_PAGE, totalCount)} av ${totalCount}`}
                  {q && ` för "${q}"`}
                </p>

                {/* Sortering mobile */}
                <form method="GET" action="/butik/produkter" className="lg:hidden">
                  {kategori && <input type="hidden" name="kategori" value={kategori} />}
                  {q && <input type="hidden" name="q" value={q} />}
                  <select
                    name="sort"
                    defaultValue={sort}
                    onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
                    className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-sage-300"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </form>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-24">
                  <Package className="h-14 w-14 text-sage-200 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-600 mb-2">
                    Inga produkter hittades
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Prova ett annat sökord eller ta bort filter.
                  </p>
                  <Link href="/butik/produkter" className="text-sm font-medium text-green-700 hover:underline">
                    Visa alla produkter
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isPopular={popularSet.has(product.id)}
                      />
                    ))}
                  </div>

                  {/* ── PAGINERING ───────────────────────── */}
                  {totalPages > 1 && (
                    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Paginering">
                      {/* Föregående */}
                      {page > 1 ? (
                        <Link href={buildUrl({ sida: String(page - 1) })}
                          className="px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-sage-50 border border-gray-200 transition-colors">
                          ←
                        </Link>
                      ) : (
                        <span className="px-3 py-2 rounded-xl text-sm text-gray-300 border border-gray-100">←</span>
                      )}

                      {/* Sidor */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                        .reduce<(number | "…")[]>((acc, p, i, arr) => {
                          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "…" ? (
                            <span key={`dots-${i}`} className="px-2 py-2 text-sm text-gray-400">…</span>
                          ) : (
                            <Link key={p} href={buildUrl({ sida: p === 1 ? "" : String(p) })}
                              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                p === page
                                  ? "bg-green-600 text-white"
                                  : "text-gray-600 hover:bg-sage-50 border border-gray-200"
                              }`}>
                              {p}
                            </Link>
                          )
                        )}

                      {/* Nästa */}
                      {page < totalPages ? (
                        <Link href={buildUrl({ sida: String(page + 1) })}
                          className="px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-sage-50 border border-gray-200 transition-colors">
                          →
                        </Link>
                      ) : (
                        <span className="px-3 py-2 rounded-xl text-sm text-gray-300 border border-gray-100">→</span>
                      )}
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
