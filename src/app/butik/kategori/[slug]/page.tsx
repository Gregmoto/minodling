export const revalidate = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, Sprout } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSettings();
  const category = await prisma.shopCategory.findUnique({ where: { slug } });
  if (!category) return { title: "Kategori hittades inte" };
  return {
    title: `${category.name} – Butik | Minodling`,
    description: category.description ?? `Utforska ${category.name} i Minodlings butik.`,
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/butik/kategori/${slug}` },
  };
}

export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [category, navUser] = await Promise.all([
    prisma.shopCategory.findUnique({
      where: { slug, isActive: true },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getNavUser(user?.id),
  ]);

  if (!category) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        <section className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={[
                { name: "Butik", href: "/butik" },
                { name: category.name, href: `/butik/kategori/${slug}` },
              ]}
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{category.name}</h1>
            {category.description && (
              <p className="mt-2 text-gray-600 max-w-xl">{category.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">{category.products.length} produkter</p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {category.products.length === 0 ? (
            <Card className="text-center py-20">
              <Package className="h-14 w-14 text-sage-200 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-600 mb-2">Inga produkter i denna kategori</h2>
              <p className="text-sm text-gray-400 mb-4">Vi arbetar med att fylla sortimentet.</p>
              <Link href="/butik" className="text-sm font-medium text-green-700 hover:underline">
                Tillbaka till butiken
              </Link>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.products.map((product) => (
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
                          <Sprout className="h-12 w-12 text-sage-200" />
                        </div>
                      )}
                      {product.stockQuantity === 0 && (
                        <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Slut i lager
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h2 className="font-semibold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
                        {product.name}
                      </h2>
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
      </main>

      <Footer />
    </div>
  );
}
