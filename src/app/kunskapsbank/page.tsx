export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Library } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Kunskapsbank – Odlingskunskap",
    description: "Fördjupa dig i odlingskunskap. Artiklar om jord, kompost, bevattning, skadedjur och mycket mer för svenska odlare.",
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/kunskapsbank` },
  };
}

export default async function KunskapsbankPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  const kategori = params.kategori;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [articles, kategorier, navUser] = await Promise.all([
    prisma.knowledgeArticle.findMany({
      where: { published: true, ...(kategori ? { category: kategori } : {}) },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, excerpt: true, imageUrl: true, category: true, createdAt: true },
    }).catch(() => []),
    prisma.knowledgeArticle.findMany({
      where: { published: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }).catch(() => []),
    getNavUser(user?.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-10">
          <Breadcrumbs items={[{ name: "Kunskapsbank", href: "/kunskapsbank" }]} />

          <div className="mt-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Library className="h-5 w-5 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Kunskapsbank</h1>
            </div>
            <p className="text-gray-500">Fördjupad odlingskunskap för alla nivåer.</p>
          </div>

          {kategorier.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Link
                href="/kunskapsbank"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !kategori ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Alla
              </Link>
              {kategorier.map((k) => k.category && (
                <Link
                  key={k.category}
                  href={`/kunskapsbank?kategori=${k.category}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    kategori === k.category ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {k.category}
                </Link>
              ))}
            </div>
          )}

          {articles.length === 0 ? (
            <div className="text-center py-16">
              <Library className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Inga artiklar publicerade än.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link key={a.slug} href={`/kunskapsbank/${a.slug}`}>
                  <Card hover padding="none" className="h-full overflow-hidden">
                    {a.imageUrl ? (
                      <div className="relative w-full h-40">
                        <Image src={a.imageUrl} alt={a.title} fill className="object-cover" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                        <Library className="h-8 w-8 text-purple-200" />
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      {a.category && <Badge variant="outline" size="sm">{a.category}</Badge>}
                      <h2 className="font-semibold text-gray-900 line-clamp-2">{a.title}</h2>
                      {a.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{a.excerpt}</p>}
                      <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
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
