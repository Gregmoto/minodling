export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sprout, ShoppingBag, ArrowRight, Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { NewsletterForm } from "./NewsletterForm";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Butik – Fröbutiken | Minodling",
    description: "Köp frön, odlingsverktyg och tillbehör i Minodlings butik. Allt för din trädgård.",
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/butik` },
  };
}

export default async function ButikPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [categories, featuredProducts, navUser] = await Promise.all([
    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    }).catch(() => []),
    prisma.shopProduct.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }).catch(() => []),
    getNavUser(user?.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full mb-4">
                <ShoppingBag className="h-4 w-4" />
                Fröbutiken
              </div>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl leading-tight">
                Odla mer med rätt verktyg
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Frön, jord och tillbehör noggrant utvalda för svenska odlare. Allt du behöver för en rik skörd.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#kategorier"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                >
                  Utforska sortimentet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Kategorier */}
        {categories.length > 0 && (
          <section id="kategorier" className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Kategorier</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/butik/kategori/${cat.slug}`} className="group">
                    <Card hover padding="none" className="overflow-hidden">
                      <div className="relative h-28 bg-sage-50">
                        {cat.imageUrl ? (
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-10 w-10 text-sage-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 text-sm group-hover:text-green-700 transition-colors">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Utvalda produkter */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Utvalda produkter</h2>
            </div>

            {featuredProducts.length === 0 ? (
              <Card className="text-center py-20">
                <Sprout className="h-14 w-14 text-sage-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Sortimentet fylls på snart</h3>
                <p className="text-sm text-gray-400">Vi arbetar med att fylla butiken med produkter.</p>
              </Card>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/butik/produkt/${product.slug}`} className="group block h-full">
                    <Card hover padding="none" className="overflow-hidden h-full flex flex-col">
                      <div className="relative h-48 bg-sage-50 shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-12 w-12 text-sage-200" />
                          </div>
                        )}
                        {product.isFeatured && (
                          <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Utvald
                          </span>
                        )}
                        {product.stockQuantity === 0 && (
                          <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Slut i lager
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        {product.category && (
                          <span className="text-[11px] font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full self-start">
                            {product.category.name}
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
                          {product.name}
                        </h3>
                        {product.shortDescription && (
                          <p className="text-xs text-gray-500 line-clamp-2">{product.shortDescription}</p>
                        )}
                        <div className="mt-auto pt-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-green-700">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Nyhetsbrev */}
        <section className="py-12 bg-gradient-to-br from-sage-50 to-green-50 border-t border-sage-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <Sprout className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Få odlingstips i inkorgen</h2>
              <p className="text-gray-600 mb-6">
                Prenumerera på vårt nyhetsbrev och få exklusiva erbjudanden och säsongsanpassade odlingstips.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
