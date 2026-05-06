export const revalidate = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSettings();
  const product = await prisma.shopProduct.findUnique({ where: { slug } });
  if (!product) return { title: "Produkt hittades inte" };
  return {
    title: `${product.seoTitle ?? product.name} – Butik | Minodling`,
    description: product.seoDescription ?? product.shortDescription ?? product.description?.slice(0, 160) ?? "",
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/butik/produkt/${slug}` },
  };
}

export default async function ProduktPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const s = await getSettings();

  const [product, navUser] = await Promise.all([
    prisma.shopProduct.findUnique({
      where: { slug, isActive: true },
      include: { category: { select: { name: true, slug: true } } },
    }),
    getNavUser(user?.id),
  ]);

  if (!product) notFound();

  const baseUrl = s.seoCanonical.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.shortDescription ?? "",
    image: product.imageUrl ? [product.imageUrl] : [],
    sku: product.sku ?? undefined,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "SEK",
      availability: product.stockQuantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${baseUrl}/butik/produkt/${slug}`,
    },
  };

  const breadcrumbs = [
    { name: "Butik", href: "/butik" },
    ...(product.category ? [{ name: product.category.name, href: `/butik/kategori/${product.category.slug}` }] : []),
    { name: product.name, href: `/butik/produkt/${slug}` },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={jsonLd} />
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Bild */}
            <div className="relative aspect-square bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-sage-200" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              {product.category && (
                <span className="inline-block text-xs font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2.5 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {product.shortDescription && (
                <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Pris */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-700">{formatPrice(product.price)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                    <Badge variant="danger" size="sm">
                      -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Lagerstatus */}
              <div>
                {product.stockQuantity > 0 ? (
                  <Badge variant="success" dot>
                    I lager ({product.stockQuantity} kvar)
                  </Badge>
                ) : (
                  <Badge variant="danger" dot>
                    Slut i lager
                  </Badge>
                )}
              </div>

              {/* Lägg i varukorg */}
              <AddToCartButton
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  stock: product.stockQuantity,
                }}
              />

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-gray-400">Artikelnr: {product.sku}</p>
              )}
            </div>
          </div>

          {/* Beskrivning */}
          {product.description && (
            <div className="mt-12 max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Produktbeskrivning</h2>
              <div className="prose prose-sm prose-green max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
