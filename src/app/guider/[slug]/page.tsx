export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { guideMetadata, articleSchema, truncateDescription, canonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [guide, settings] = await Promise.all([
    prisma.guide.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!guide || !guide.published) return { title: "Guide hittades inte" };
  return guideMetadata(guide, settings, `/guider/${slug}`);
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [guide, settings] = await Promise.all([
    prisma.guide.findUnique({ where: { slug } }),
    getSettings(),
  ]);

  if (!guide || !guide.published) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile for navUser
  const navProfile = user ? await import("@/lib/prisma").then((m) =>
    m.default.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
    })
  ) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  // Related content
  const [relatedGuides, relatedPlants, relatedGlossary, relatedArticles] = await Promise.all([
    prisma.guide.findMany({
      where: { published: true, category: guide.category ?? undefined, slug: { not: slug } },
      select: { slug: true, title: true, difficultyLevel: true },
      take: 4,
    }),
    prisma.plant.findMany({
      where: guide.category === "Grönsaker" || guide.category === "Frukter & bär" || guide.category === "Kryddor & örter"
        ? {}
        : { category: guide.category ?? undefined },
      select: { slug: true, name: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.glossaryTerm.findMany({
      select: { slug: true, term: true },
      take: 5,
      orderBy: { term: "asc" },
    }),
    prisma.knowledgeArticle.findMany({
      where: { published: true },
      select: { slug: true, title: true, category: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const path = `/guider/${slug}`;
  const schema = articleSchema({
    title: guide.title,
    description: guide.seoDescription ?? (guide.excerpt ? truncateDescription(guide.excerpt) : `Guide om ${guide.title}`),
    url: canonicalUrl(settings, path),
    imageUrl: guide.imageUrl,
    datePublished: guide.createdAt,
    dateModified: guide.updatedAt,
    siteName: settings.siteName,
    seoCanonical: settings.seoCanonical,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        {guide.imageUrl ? (
          <div className="relative h-72 sm:h-96 overflow-hidden">
            <img src={guide.imageUrl} alt={guide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 container-main py-8">
              <div className="flex gap-2 mb-3">
                {guide.category && <Badge variant="outline" size="sm" className="bg-white/20 border-white/40 text-white">{guide.category}</Badge>}
                {guide.difficultyLevel && <Badge variant="outline" size="sm" className="bg-white/20 border-white/40 text-white">{guide.difficultyLevel}</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{guide.title}</h1>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-50 to-green-50 py-12">
            <div className="container-main">
              <div className="flex gap-2 mb-3">
                {guide.category && <Badge variant="outline">{guide.category}</Badge>}
                {guide.difficultyLevel && <Badge variant="default">{guide.difficultyLevel}</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{guide.title}</h1>
            </div>
          </div>
        )}

        <div className="container-main py-8">
          <Breadcrumbs
            items={[{ name: "Guider", href: "/guider" }, { name: guide.title, href: path }]}
            seoCanonical={settings.seoCanonical}
            className="mb-6"
          />
          <JsonLd data={schema} />

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Artikel */}
            <article className="flex-1 min-w-0 max-w-3xl">
              {guide.excerpt && (
                <p className="text-lg text-gray-600 leading-relaxed mb-8 font-medium">{guide.excerpt}</p>
              )}

              {guide.content ? (
                <div className="prose-minodling" dangerouslySetInnerHTML={{ __html: guide.content }} />
              ) : (
                <Card><p className="text-gray-400 text-center py-8">Innehåll kommer snart.</p></Card>
              )}

              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                <Link href="/guider" className="text-green-700 hover:text-green-800 transition-colors">← Alla guider</Link>
                <span>Publicerad {formatDate(guide.createdAt)}</span>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-6">

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
                  </div>
                )}

                {/* Växtdatabasen */}
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

                {/* Ordlista */}
                {relatedGlossary.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ordlista</p>
                    <div className="space-y-2">
                      {relatedGlossary.map((g) => (
                        <Link key={g.slug} href={`/ordlista/${g.slug}`}
                          className="block text-sm text-gray-700 hover:text-green-700 transition-colors">
                          📘 {g.term}
                        </Link>
                      ))}
                    </div>
                    <Link href="/ordlista" className="mt-2 block text-xs text-green-600 hover:underline">
                      Hela ordlistan →
                    </Link>
                  </div>
                )}

                {/* Kunskapsbank */}
                {relatedArticles.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Kunskapsbank</p>
                    <div className="space-y-2">
                      {relatedArticles.map((a) => (
                        <Link key={a.slug} href={`/kunskapsbank/${a.slug}`}
                          className="block text-sm text-gray-700 hover:text-indigo-700 transition-colors leading-snug">
                          📚 {a.title}
                        </Link>
                      ))}
                    </div>
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
