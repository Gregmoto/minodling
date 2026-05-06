export const revalidate = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ProductCard, ProductCardData } from "@/components/shop/ProductCard";
import { FilterSidebar } from "./FilterSidebar";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?:    string;
    prisMin?: string;
    prisMax?: string;
    svarighet?: string;
    odling?:  string;
    vaxt?:    string;
    lager?:   string;
    sida?:    string;
  }>;
}

const PER_PAGE = 24;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSettings();
  const category = await prisma.shopCategory.findUnique({ where: { slug } }).catch(() => null);
  if (!category) return { title: "Kategori hittades inte" };
  return {
    title: category.seoTitle ?? `${category.name} – Minodling Butik`,
    description: category.seoDescription ?? category.description ?? `Utforska ${category.name} i Minodlings butik.`,
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/butik/kategori/${slug}` },
    openGraph: {
      title: category.seoTitle ?? `${category.name} – Minodling Butik`,
      description: category.seoDescription ?? category.description ?? "",
      images: category.imageUrl ? [{ url: category.imageUrl }] : [],
    },
  };
}

export default async function KategoriPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const sort     = sp.sort ?? "nyast";
  const prisMin  = sp.prisMin ?? "";
  const prisMax  = sp.prisMax ?? "";
  const svarighet = sp.svarighet ?? "";
  const odling   = sp.odling ?? "";
  const vaxt     = sp.vaxt ?? "";
  const lager    = sp.lager === "1";
  const page     = Math.max(1, Number(sp.sida ?? "1"));

  const hasActiveFilters = !!(prisMin || prisMax || svarighet || odling || vaxt || lager || (sort && sort !== "nyast"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Hämta kategori + alla andra aktiva kategorier + växter kopplade till produkter i denna kategori
  const [category, allCategories, navUser] = await Promise.all([
    prisma.shopCategory.findFirst({
      where: { slug, isActive: true },
    }).catch(() => null),
    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, imageUrl: true, _count: { select: { products: { where: { isActive: true } } } } },
    }).catch(() => []),
    getNavUser(user?.id),
  ]);

  if (!category) notFound();

  // Bygg where-klausul för produkter
  const where: Record<string, unknown> = {
    isActive: true,
    categoryId: category.id,
  };

  if (prisMin) where.price = { ...((where.price as object) ?? {}), gte: Math.round(parseFloat(prisMin) * 100) };
  if (prisMax) where.price = { ...((where.price as object) ?? {}), lte: Math.round(parseFloat(prisMax) * 100) };
  if (svarighet) where.difficultyLevel = svarighet;
  if (odling) where.growingType = { contains: odling, mode: "insensitive" };
  if (lager) where.stockQuantity = { gt: 0 };

  // Filter: kopplad växt (via plantLinks)
  if (vaxt) {
    const plant = await prisma.plant.findUnique({ where: { slug: vaxt }, select: { id: true } }).catch(() => null);
    if (plant) {
      where.plantLinks = { some: { plantId: plant.id } };
    }
  }

  // Hämta växter som faktiskt är kopplade till produkter i denna kategori
  const linkedPlants = await prisma.plant.findMany({
    where: {
      productLinks: {
        some: {
          product: { categoryId: category.id, isActive: true },
        },
      },
    },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  }).catch(() => []);

  // Ordning
  function buildOrderBy(s: string) {
    if (s === "pris-asc") return { price: "asc" as const };
    if (s === "pris-hog") return { price: "desc" as const };
    return { createdAt: "desc" as const };
  }

  const productSelect = {
    id: true, slug: true, name: true, shortDescription: true,
    price: true, compareAtPrice: true, imageUrl: true,
    stockQuantity: true, isFeatured: true, difficultyLevel: true, createdAt: true,
    category: { select: { name: true, slug: true } },
  } as const;

  const [totalCount, products] = await Promise.all([
    prisma.shopProduct.count({ where }).catch(() => 0),
    prisma.shopProduct.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: productSelect,
    }).catch(() => []),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const skip = (page - 1) * PER_PAGE;

  // Relaterade kategorier = alla utom den aktuella
  const relatedCategories = allCategories.filter((c) => c.slug !== slug && c._count.products > 0);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (sort && sort !== "nyast") p.set("sort", sort);
    if (prisMin) p.set("prisMin", prisMin);
    if (prisMax) p.set("prisMax", prisMax);
    if (svarighet) p.set("svarighet", svarighet);
    if (odling) p.set("odling", odling);
    if (vaxt) p.set("vaxt", vaxt);
    if (lager) p.set("lager", "1");
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    const str = p.toString();
    return `/butik/kategori/${slug}${str ? `?${str}` : ""}`;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">

        {/* ── HERO-HEADER ─────────────────────────────── */}
        <section className="relative border-b border-sage-100 overflow-hidden">
          {category.imageUrl ? (
            <>
              <div className="absolute inset-0">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              </div>
              <div className="relative container-main py-16">
                <Breadcrumbs
                  items={[
                    { name: "Butik", href: "/butik" },
                    { name: "Produkter", href: "/butik/produkter" },
                    { name: category.name, href: `/butik/kategori/${slug}` },
                  ]}
                  className="mb-4 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white/50 [&_li:last-child_span]:text-white"
                />
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{category.name}</h1>
                {category.description && (
                  <p className="mt-3 text-white/80 max-w-xl leading-relaxed">{category.description}</p>
                )}
                <p className="mt-3 text-white/60 text-sm">{totalCount} {totalCount === 1 ? "produkt" : "produkter"}</p>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-b from-sage-50 to-cream-50 py-10">
              <div className="container-main">
                <Breadcrumbs
                  items={[
                    { name: "Butik", href: "/butik" },
                    { name: "Produkter", href: "/butik/produkter" },
                    { name: category.name, href: `/butik/kategori/${slug}` },
                  ]}
                  className="mb-4"
                />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{category.name}</h1>
                {category.description && (
                  <p className="mt-2 text-gray-600 max-w-xl">{category.description}</p>
                )}
                <p className="mt-1 text-sm text-gray-400">{totalCount} {totalCount === 1 ? "produkt" : "produkter"}</p>
              </div>
            </div>
          )}
        </section>

        {/* ── HUVUDINNEHÅLL ────────────────────────────── */}
        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar med filter */}
            <FilterSidebar
              plants={linkedPlants}
              sort={sort}
              prisMin={prisMin}
              prisMax={prisMax}
              svarighet={svarighet}
              odling={odling}
              vaxt={vaxt}
              lager={lager}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Produktgrid */}
            <div className="flex-1 min-w-0">
              {/* Status-rad */}
              <div className="flex items-center justify-between mb-5 gap-3">
                <p className="text-sm text-gray-500">
                  {totalCount === 0
                    ? "Inga produkter hittades"
                    : `Visar ${skip + 1}–${Math.min(skip + PER_PAGE, totalCount)} av ${totalCount}`}
                  {hasActiveFilters && <span className="ml-1 text-amber-600 font-medium">· Filtrerat</span>}
                </p>
                {/* Mobil-sortering */}
                <form method="GET" action={`/butik/kategori/${slug}`} className="lg:hidden">
                  {prisMin && <input type="hidden" name="prisMin" value={prisMin} />}
                  {prisMax && <input type="hidden" name="prisMax" value={prisMax} />}
                  {svarighet && <input type="hidden" name="svarighet" value={svarighet} />}
                  {odling && <input type="hidden" name="odling" value={odling} />}
                  {vaxt && <input type="hidden" name="vaxt" value={vaxt} />}
                  {lager && <input type="hidden" name="lager" value="1" />}
                  <select
                    name="sort"
                    defaultValue={sort}
                    onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
                    className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white"
                  >
                    <option value="nyast">Nyast</option>
                    <option value="pris-asc">Lägst pris</option>
                    <option value="pris-hog">Högst pris</option>
                  </select>
                </form>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-24">
                  <Package className="h-14 w-14 text-sage-200 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-600 mb-2">Inga produkter hittades</h2>
                  <p className="text-sm text-gray-400 mb-4">Prova att justera filtren.</p>
                  <Link href={`/butik/kategori/${slug}`} className="text-sm font-medium text-green-700 hover:underline">
                    Rensa alla filter
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {(products as ProductCardData[]).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Paginering */}
                  {totalPages > 1 && (
                    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Paginering">
                      {page > 1 ? (
                        <Link href={buildUrl({ sida: String(page - 1) })}
                          className="px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-sage-50 border border-gray-200 transition-colors">
                          ←
                        </Link>
                      ) : (
                        <span className="px-3 py-2 rounded-xl text-sm text-gray-300 border border-gray-100">←</span>
                      )}

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

        {/* ── RELATERADE KATEGORIER ────────────────────── */}
        {relatedCategories.length > 0 && (
          <section className="border-t border-sage-100 bg-white py-10">
            <div className="container-main">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Fler kategorier</h2>
              <div className="flex flex-wrap gap-3">
                {relatedCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/butik/kategori/${cat.slug}`}
                    className="group flex items-center gap-3 px-4 py-2.5 bg-sage-50 hover:bg-green-50 border border-sage-100 hover:border-green-200 rounded-xl transition-colors"
                  >
                    {cat.imageUrl && (
                      <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0">
                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-green-700 transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-400">{cat._count.products} produkter</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SEO-TEXT ────────────────────────────────── */}
        {category.seoText && (
          <section className="border-t border-sage-100 py-10">
            <div className="container-main max-w-3xl">
              <div className="prose prose-sm prose-gray max-w-none text-gray-500 leading-relaxed">
                {category.seoText.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
