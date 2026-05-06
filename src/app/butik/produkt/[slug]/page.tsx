export const revalidate = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  RotateCcw,
  Sprout,
  Tag,
  Gauge,
  Flower2,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPrice } from "@/lib/utils";
import { ProductCard, ProductCardData } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { BuyWidget } from "@/components/shop/BuyWidget";
import { StarRating } from "@/components/shop/StarRating";
import { ReviewSection } from "./ReviewSection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── SEO ───────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSettings();
  const product = await prisma.shopProduct.findUnique({
    where: { slug },
    select: {
      name: true, seoTitle: true, seoDescription: true,
      shortDescription: true, description: true, imageUrl: true,
    },
  }).catch(() => null);

  if (!product) return { title: "Produkt hittades inte" };

  const title = product.seoTitle ?? `${product.name} – Minodling Butik`;
  const description =
    product.seoDescription ??
    product.shortDescription ??
    product.description?.slice(0, 160) ??
    `Köp ${product.name} i Minodlings butik.`;
  const canonical = `${s.seoCanonical.replace(/\/$/, "")}/butik/produkt/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : [],
    },
  };
}

// ── Hjälpfunktioner ───────────────────────────────────────────────

function difficultyLabel(level: string | null) {
  if (level === "easy")   return { label: "Nybörjarvänlig", variant: "success" as const, icon: "🌱" };
  if (level === "medium") return { label: "Medel",          variant: "warning" as const, icon: "🌿" };
  if (level === "hard")   return { label: "Avancerad",      variant: "danger"  as const, icon: "🌳" };
  return null;
}

function relationLabel(relationType: string): string {
  switch (relationType) {
    case "recommended": return "Rekommenderas för";
    case "companion":   return "Bra sällskapsväxt för";
    default:            return "Passar till";
  }
}

// ── Page ──────────────────────────────────────────────────────────

export default async function ProduktPage({ params }: PageProps) {
  const { slug } = await params;

  const user = await getCurrentUser();
  const s = await getSettings();

  const [product, navUser] = await Promise.all([
    prisma.shopProduct.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        plantLinks: {
          include: {
            plant: {
              select: { id: true, name: true, slug: true, latinName: true, imageUrl: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }).catch(() => null),
    getNavUser(user?.id),
  ]);

  if (!product) notFound();

  // Reviews
  const reviews = await prisma.shopProductReview.findMany({
    where: { productId: product.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, rating: true, title: true, content: true,
      imageUrls: true, isVerifiedPurchase: true,
      adminReply: true, adminRepliedAt: true, createdAt: true,
      user: { select: { fullName: true, username: true } },
    },
  }).catch(() => []);

  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
    : 0;

  // Current user's review
  let userReview: { id: string; rating: number; title: string | null; content: string | null } | null = null;
  if (user) {
    const profile = await prisma.profile
      .findUnique({ where: { userId: user.id }, select: { id: true } })
      .catch(() => null);
    if (profile) {
      userReview = await prisma.shopProductReview.findUnique({
        where: { productId_userId: { productId: product.id, userId: profile.id } },
        select: { id: true, rating: true, title: true, content: true },
      }).catch(() => null);
    }
  }

  // Relaterade produkter: samma kategori, exkl. denna produkt
  const relatedProducts = product.categoryId
    ? await prisma.shopProduct.findMany({
        where: {
          isActive: true,
          categoryId: product.categoryId,
          id: { not: product.id },
        },
        orderBy: { isFeatured: "desc" },
        take: 4,
        select: {
          id: true, slug: true, name: true, shortDescription: true,
          price: true, compareAtPrice: true, imageUrl: true,
          stockQuantity: true, isFeatured: true, difficultyLevel: true, createdAt: true,
          category: { select: { name: true, slug: true } },
        },
      }).catch(() => [])
    : [];

  const baseUrl = s.seoCanonical.replace(/\/$/, "");
  const canonicalUrl = `${baseUrl}/butik/produkt/${slug}`;

  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = onSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : null;
  const difficulty = difficultyLabel(product.difficultyLevel);
  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...product.galleryImages,
  ];

  // Breadcrumbs
  const breadcrumbItems = [
    { name: "Butik", href: "/butik" },
    { name: "Produkter", href: "/butik/produkter" },
    ...(product.category
      ? [{ name: product.category.name, href: `/butik/kategori/${product.category.slug}` }]
      : []),
    { name: product.name, href: `/butik/produkt/${slug}` },
  ];

  // Schema.org
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.shortDescription ?? "",
    image: allImages,
    sku: product.sku ?? undefined,
    brand: { "@type": "Brand", name: "Minodling" },
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "SEK",
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: canonicalUrl,
      itemCondition: "https://schema.org/NewCondition",
      ...(onSale
        ? {
            priceValidUntil: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
          }
        : {}),
    },
    ...(product.category
      ? { category: product.category.name }
      : {}),
    ...(totalCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: totalCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={jsonLd} />
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        <div className="container-main py-6 sm:py-10">

          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          {/* ── HUVUDSEKTION: bild + info ────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

            {/* Galleri */}
            <ProductGallery
              mainImage={product.imageUrl}
              gallery={product.galleryImages}
              name={product.name}
            />

            {/* Produktinfo */}
            <div className="space-y-5 lg:pt-2">

              {/* Kategori + badges */}
              <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                  <Link
                    href={`/butik/kategori/${product.category.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2.5 py-1 rounded-full hover:bg-sage-100 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    {product.category.name}
                  </Link>
                )}
                {product.isFeatured && (
                  <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded-full">
                    ⭐ Rekommenderad
                  </span>
                )}
                {onSale && (
                  <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">
                    -{discountPct}% REA
                  </span>
                )}
              </div>

              {/* Namn */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Betyg */}
              {totalCount > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} size="sm" />
                  <span className="text-sm text-gray-500">
                    {avgRating.toFixed(1)} ({totalCount} {totalCount === 1 ? "omdöme" : "omdömen"})
                  </span>
                </div>
              )}

              {/* Kort beskrivning */}
              {product.shortDescription && (
                <p className="text-gray-600 leading-relaxed text-base">
                  {product.shortDescription}
                </p>
              )}

              {/* Pris */}
              <div className="flex items-baseline gap-3 py-1">
                <span className={`text-3xl font-bold ${onSale ? "text-red-600" : "text-gray-900"}`}>
                  {formatPrice(product.price)}
                </span>
                {onSale && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
              </div>

              {/* Lagerstatus */}
              <div className="flex items-center gap-2">
                {product.stockQuantity > 0 ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-700">
                      I lager
                      {product.stockQuantity <= 10 && (
                        <span className="ml-1 text-amber-600">
                          – bara {product.stockQuantity} kvar
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-sm font-medium text-red-600">Slut i lager</span>
                  </>
                )}
              </div>

              {/* Köp-widget */}
              <div className="py-2">
                <BuyWidget
                  product={{
                    productId: product.id,
                    slug:      product.slug,
                    name:      product.name,
                    price:     product.price,
                    imageUrl:  product.imageUrl,
                    stock:     product.stockQuantity,
                  }}
                />
              </div>

              {/* Produktegenskaper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-sage-100">
                {difficulty && (
                  <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-sage-100">
                    <div className="h-8 w-8 rounded-lg bg-sage-50 flex items-center justify-center shrink-0">
                      <Gauge className="h-4 w-4 text-sage-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Svårighetsgrad</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {difficulty.icon} {difficulty.label}
                      </p>
                    </div>
                  </div>
                )}
                {product.growingType && (
                  <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-sage-100">
                    <div className="h-8 w-8 rounded-lg bg-sage-50 flex items-center justify-center shrink-0">
                      <Sprout className="h-4 w-4 text-sage-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Odlingstyp</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{product.growingType}</p>
                    </div>
                  </div>
                )}
                {product.sku && (
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400">Artikelnr:</span>
                    <span className="text-xs font-mono text-gray-600">{product.sku}</span>
                  </div>
                )}
              </div>

              {/* Leverans + retur */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-sage-100">
                  <Truck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Leverans 2–4 vardagar</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Fri frakt vid köp över 499 kr · Standard 49 kr
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-sage-100">
                  <RotateCcw className="h-4 w-4 text-sage-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">14 dagars öppet köp</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ångra ditt köp utan krångel · Enkel returprocess
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── BESKRIVNING + VÄXTER ────────────────────────── */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Lång beskrivning */}
            <div className="lg:col-span-2">
              {product.description && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="h-5 w-1 bg-green-500 rounded-full" />
                    Produktbeskrivning
                  </h2>
                  <div className="prose prose-sm prose-green max-w-none text-gray-600 leading-relaxed whitespace-pre-line bg-white rounded-2xl border border-sage-100 p-6 shadow-sm">
                    {product.description}
                  </div>
                </section>
              )}
            </div>

            {/* Kopplade växter */}
            {product.plantLinks.length > 0 && (
              <aside>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="h-5 w-1 bg-emerald-500 rounded-full" />
                  Passar till
                </h2>
                <div className="space-y-3">
                  {product.plantLinks.map(({ plant, relationType }) => (
                    <Link
                      key={plant.id}
                      href={`/vaxtdatabas/${plant.slug}`}
                      className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-sage-100 hover:border-green-300 hover:bg-green-50/50 transition-all group shadow-sm"
                    >
                      {plant.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-sage-100">
                          <Image
                            src={plant.imageUrl}
                            alt={plant.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-sage-50 border border-sage-100 flex items-center justify-center shrink-0">
                          <Flower2 className="h-5 w-5 text-sage-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">
                          {relationLabel(relationType)}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors truncate">
                          {plant.name}
                        </p>
                        {plant.latinName && (
                          <p className="text-xs text-gray-400 italic truncate">{plant.latinName}</p>
                        )}
                      </div>
                      <span className="ml-auto text-sage-300 group-hover:text-green-400 transition-colors text-lg">›</span>
                    </Link>
                  ))}

                  <Link
                    href="/vaxtdatabas"
                    className="block text-center text-xs text-green-700 hover:underline pt-1"
                  >
                    Utforska växtdatabasen →
                  </Link>
                </div>
              </aside>
            )}

          </div>

          {/* ── OMDÖMEN ─────────────────────────────────────── */}
          <ReviewSection
            productId={product.id}
            productName={product.name}
            reviews={reviews}
            avgRating={avgRating}
            totalCount={totalCount}
            userReview={userReview}
            isLoggedIn={!!user}
          />

          {/* ── RELATERADE PRODUKTER ─────────────────────────── */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 pt-10 border-t border-sage-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Fler i samma kategori</h2>
                {product.category && (
                  <Link
                    href={`/butik/kategori/${product.category.slug}`}
                    className="text-sm font-medium text-green-700 hover:underline"
                  >
                    Visa alla →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {(relatedProducts as ProductCardData[]).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
