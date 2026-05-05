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
import { BookText, Search } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Odlingsordlista – Förstå odlingstermer",
    description: "Lär dig odlingstermer och begrepp. Vår ordlista förklarar allt från omskolning till täckodling på enkelt svenska.",
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/ordlista` },
  };
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");

export default async function OrdlistaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; bokstav?: string; kategori?: string }>;
}) {
  const params = await searchParams;
  const q        = params.q        ?? "";
  const bokstav  = params.bokstav  ?? "";
  const kategori = params.kategori ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [terms, categories, navUser] = await Promise.all([
    prisma.glossaryTerm.findMany({
      where: {
        published: true,
        AND: [
          q       ? { term: { contains: q,        mode: "insensitive" } } : {},
          bokstav ? { term: { startsWith: bokstav, mode: "insensitive" } } : {},
          kategori ? { category: kategori } : {},
        ],
      },
      orderBy: { term: "asc" },
      select: { slug: true, term: true, shortDescription: true, category: true },
    }).catch(() => []),
    prisma.glossaryTerm.findMany({
      where: { published: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }).catch(() => []),
    getNavUser(user?.id),
  ]);

  const uniqueCategories = categories.map((c) => c.category!).filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-50 to-green-50 border-b border-gray-100 py-10">
          <div className="container-main">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <BookText className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Odlingsordlista</h1>
            </div>
            <p className="text-gray-500 max-w-xl">
              Förstå odlingstermer och begrepp – från nybörjare till erfaren odlare.
            </p>
          </div>
        </div>

        <div className="container-main py-8">
          <Breadcrumbs items={[{ name: "Odlingsordlista", href: "/ordlista" }]} className="mb-6" />

          {/* Sök */}
          <form method="get" className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Sök term..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
              />
              {bokstav  && <input type="hidden" name="bokstav"  value={bokstav} />}
              {kategori && <input type="hidden" name="kategori" value={kategori} />}
            </div>
          </form>

          {/* Kategorier */}
          {uniqueCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                href={`/ordlista${q ? `?q=${q}` : ""}`}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  !kategori ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                Alla kategorier
              </Link>
              {uniqueCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/ordlista?kategori=${encodeURIComponent(cat)}${q ? `&q=${q}` : ""}`}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    kategori === cat ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {/* Alfabetsfilter */}
          <div className="flex flex-wrap gap-1 mb-8">
            <Link
              href={`/ordlista${kategori ? `?kategori=${encodeURIComponent(kategori)}` : ""}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                !bokstav ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              Alla
            </Link>
            {ALPHABET.map((b) => (
              <Link
                key={b}
                href={`/ordlista?bokstav=${b}${kategori ? `&kategori=${encodeURIComponent(kategori)}` : ""}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  bokstav === b ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {b}
              </Link>
            ))}
          </div>

          {/* Resultat */}
          {terms.length === 0 ? (
            <div className="text-center py-16">
              <BookText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Inga termer hittades.</p>
              <Link href="/ordlista" className="mt-4 inline-block text-sm text-green-700 hover:underline">
                Visa alla termer
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">{terms.length} termer</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {terms.map((t) => (
                  <Link key={t.slug} href={`/ordlista/${t.slug}`}>
                    <Card hover className="h-full space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base font-semibold text-gray-900">{t.term}</h2>
                        {t.category && <Badge variant="outline" size="sm">{t.category}</Badge>}
                      </div>
                      {t.shortDescription && (
                        <p className="text-sm text-gray-500 line-clamp-2">{t.shortDescription}</p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
