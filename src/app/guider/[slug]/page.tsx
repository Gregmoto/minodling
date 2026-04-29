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
  const navUser = user ? { id: user.id, username: user.email ?? "användare", displayName: null, avatarUrl: null } : null;

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

        <div className="container-main py-8 max-w-3xl">
          <Breadcrumbs
            items={[{ name: "Guider", href: "/guider" }, { name: guide.title, href: path }]}
            seoCanonical={settings.seoCanonical}
            className="mb-6"
          />
          <JsonLd data={schema} />

          {guide.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed mb-8 font-medium">{guide.excerpt}</p>
          )}

          {guide.content ? (
            <div
              className="prose-minodling"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          ) : (
            <Card>
              <p className="text-gray-400 text-center py-8">Innehåll kommer snart.</p>
            </Card>
          )}

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
            <Link href="/guider" className="text-green-700 hover:text-green-800 transition-colors">
              ← Alla guider
            </Link>
            <span>Publicerad {formatDate(guide.createdAt)}</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
