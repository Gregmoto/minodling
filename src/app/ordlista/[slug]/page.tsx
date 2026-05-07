export const revalidate = 300;
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { glossaryMetadata, truncateDescription } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookText } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [term, settings] = await Promise.all([
    prisma.glossaryTerm.findUnique({ where: { slug } }).catch(() => null),
    getSettings(),
  ]);
  if (!term || !term.published) return { title: "Term hittades inte" };
  return glossaryMetadata(term, settings, `/ordlista/${slug}`);
}

export default async function OrdlistaTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const settings = await getSettings();
  const term = await prisma.glossaryTerm.findUnique({ where: { slug } }).catch(() => null);

  if (!term || !term.published) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navUser = await getNavUser(user?.id);

  // Relaterat innehåll
  const [relatedTerms, relatedGuides, relatedPlants] = await Promise.all([
    // Relaterade termer: explicit lista + samma kategori
    term.relatedSlugs.length > 0
      ? prisma.glossaryTerm.findMany({
          where: { slug: { in: term.relatedSlugs }, published: true, NOT: { slug } },
          select: { slug: true, term: true, category: true },
        })
      : prisma.glossaryTerm.findMany({
          where: { published: true, category: term.category ?? undefined, NOT: { slug } },
          select: { slug: true, term: true, category: true },
          take: 6,
          orderBy: { term: "asc" },
        }),
    // Relaterade guider: samma kategori eller söker på termen
    prisma.guide.findMany({
      where: {
        published: true,
        OR: [
          { category: term.category ?? undefined },
          { title: { contains: term.term, mode: "insensitive" } },
        ],
      },
      select: { slug: true, title: true, difficultyLevel: true },
      take: 5,
    }),
    // Relaterade växter: samma kategori
    prisma.plant.findMany({
      where: term.category
        ? { category: { contains: term.category.split(" ")[0], mode: "insensitive" } }
        : {},
      select: { slug: true, name: true },
      take: 6,
      orderBy: { name: "asc" },
    }),
  ]);

  const termSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.shortDescription ?? truncateDescription(term.fullDescription ?? `Odlingsterm: ${term.term}`),
    url: `${settings.seoCanonical}/ordlista/${slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Odlingsordlista",
      url: `${settings.seoCanonical}/ordlista`,
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        {term.imageUrl ? (
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <Image src={term.imageUrl} alt={term.term} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 container-main py-6">
              {term.category && (
                <Badge variant="outline" size="sm" className="mb-2 bg-white/20 border-white/40 text-white">
                  {term.category}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-white">{term.term}</h1>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-50 to-green-50 border-b border-gray-100 py-10">
            <div className="container-main">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <BookText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  {term.category && (
                    <Badge variant="outline" size="sm" className="mb-1">{term.category}</Badge>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900">{term.term}</h1>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container-main py-8">
          <Breadcrumbs
            items={[
              { name: "Odlingsordlista", href: "/ordlista" },
              { name: term.term, href: `/ordlista/${slug}` },
            ]}
            seoCanonical={settings.seoCanonical}
            className="mb-6"
          />
          <JsonLd data={termSchema} />

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Innehåll */}
            <article className="flex-1 min-w-0 max-w-3xl">
              {term.shortDescription && (
                <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">
                  {term.shortDescription}
                </p>
              )}

              {term.fullDescription ? (
                <div className="prose-minodling" dangerouslySetInnerHTML={{ __html: term.fullDescription }} />
              ) : (
                <Card>
                  <p className="text-gray-400 text-center py-8">Förklaring kommer snart.</p>
                </Card>
              )}

              {/* Relaterade termer – mobil (under innehållet) */}
              {relatedTerms.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 lg:hidden">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Relaterade begrepp</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedTerms.map((rt) => (
                      <Link key={rt.slug} href={`/ordlista/${rt.slug}`}>
                        <Badge variant="outline" size="sm" className="hover:bg-amber-50 transition-colors cursor-pointer">
                          📘 {rt.term}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link href="/ordlista" className="text-sm text-green-700 hover:text-green-800 transition-colors">
                  ← Tillbaka till ordlistan
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-6">

                {/* Relaterade termer */}
                {relatedTerms.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Relaterade begrepp</p>
                    <div className="space-y-2">
                      {relatedTerms.map((rt) => (
                        <Link key={rt.slug} href={`/ordlista/${rt.slug}`}
                          className="block text-sm text-gray-700 hover:text-amber-700 transition-colors">
                          📘 {rt.term}
                        </Link>
                      ))}
                    </div>
                    <Link href="/ordlista" className="mt-2 block text-xs text-green-600 hover:underline">
                      Hela ordlistan →
                    </Link>
                  </div>
                )}

                {/* Relaterade guider */}
                {relatedGuides.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Relaterade guider</p>
                    <div className="space-y-2">
                      {relatedGuides.map((g) => (
                        <Link key={g.slug} href={`/guider/${g.slug}`}
                          className="block text-sm text-gray-700 hover:text-green-700 transition-colors leading-snug">
                          📖 {g.title}
                        </Link>
                      ))}
                    </div>
                    <Link href="/guider" className="mt-2 block text-xs text-green-600 hover:underline">
                      Alla guider →
                    </Link>
                  </div>
                )}

                {/* Relaterade växter */}
                {relatedPlants.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">I växtdatabasen</p>
                    <div className="space-y-2">
                      {relatedPlants.map((p) => (
                        <Link key={p.slug} href={`/vaxtdatabas/${p.slug}`}
                          className="block text-sm text-gray-700 hover:text-green-700 transition-colors">
                          🌱 {p.name}
                        </Link>
                      ))}
                    </div>
                    <Link href="/vaxtdatabas" className="mt-2 block text-xs text-green-600 hover:underline">
                      Alla växter →
                    </Link>
                  </div>
                )}

                {/* Kategorifilter */}
                {term.category && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Kategori</p>
                    <Link
                      href={`/ordlista?kategori=${encodeURIComponent(term.category)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors">
                      <BookText className="h-3 w-3" />
                      {term.category}
                    </Link>
                  </div>
                )}

              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
