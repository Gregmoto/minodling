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
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Odlingsguider – Lär dig odla",
  description: "Kompletta odlingsguider för svenska odlare. Från frö till skörd – steg-för-steg guides om grönsaker, blommor och trädgårdsodling.",
};

const DIFFICULTY_COLORS: Record<string, "success" | "warning" | "danger" | "default"> = {
  nybörjare: "success", lätt: "success",
  medel: "warning", mellannivå: "warning",
  avancerad: "danger", svår: "danger",
};

export default async function GuiderPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  const kategori = params.kategori;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [guides, kategorier, navUser] = await Promise.all([
    prisma.guide.findMany({
      where: { published: true, ...(kategori ? { category: kategori } : {}) },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, excerpt: true, imageUrl: true, category: true, difficultyLevel: true, createdAt: true },
    }).catch(() => []),
    prisma.guide.findMany({
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
          <Breadcrumbs items={[{ name: "Guider", href: "/guider" }]} />

          <div className="mt-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Odlingsguider</h1>
            </div>
            <p className="text-gray-500">Steg-för-steg-guides från erfarna svenska odlare.</p>
          </div>

          {/* Kategorifilter */}
          {kategorier.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Link
                href="/guider"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !kategori ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Alla
              </Link>
              {kategorier.map((k) => k.category && (
                <Link
                  key={k.category}
                  href={`/guider?kategori=${k.category}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    kategori === k.category ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {k.category}
                </Link>
              ))}
            </div>
          )}

          {guides.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Inga guider publicerade än.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((g) => (
                <Link key={g.slug} href={`/guider/${g.slug}`}>
                  <Card hover padding="none" className="h-full overflow-hidden">
                    {g.imageUrl ? (
                      <img
                        src={g.imageUrl}
                        alt={`Guide: ${g.title}`}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-amber-50 to-green-50 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-amber-300" />
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {g.category && <Badge variant="outline" size="sm">{g.category}</Badge>}
                        {g.difficultyLevel && (
                          <Badge variant={DIFFICULTY_COLORS[g.difficultyLevel.toLowerCase()] ?? "default"} size="sm">
                            {g.difficultyLevel}
                          </Badge>
                        )}
                      </div>
                      <h2 className="font-semibold text-gray-900 line-clamp-2">{g.title}</h2>
                      {g.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{g.excerpt}</p>}
                      <p className="text-xs text-gray-400">{formatDate(g.createdAt)}</p>
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
