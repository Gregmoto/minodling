export const revalidate = 300;
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { articleMetadata, articleSchema, truncateDescription, canonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

const getArticle = unstable_cache(
  async (slug: string) =>
    prisma.knowledgeArticle.findUnique({ where: { slug } }).catch(() => null),
  ["article-detail"],
  { revalidate: 300, tags: ["kunskapsbank"] },
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticle(slug), getSettings()]);
  if (!article || !article.published) return { title: "Artikel hittades inte" };
  return articleMetadata(article, settings, `/kunskapsbank/${slug}`);
}

export default async function KunskapsbankArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticle(slug), getSettings()]);

  if (!article || !article.published) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const navUser = await getNavUser(user?.id);

  const path = `/kunskapsbank/${slug}`;
  const schema = articleSchema({
    title: article.title,
    description: article.seoDescription ?? (article.excerpt ? truncateDescription(article.excerpt) : article.title),
    url: canonicalUrl(settings, path),
    imageUrl: article.imageUrl,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    siteName: settings.siteName,
    seoCanonical: settings.seoCanonical,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {article.imageUrl && (
          <div className="relative h-64 overflow-hidden">
            <Image src={article.imageUrl} alt={article.title} fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        <div className="container-main py-8 max-w-3xl">
          <Breadcrumbs
            items={[
              { name: "Kunskapsbank", href: "/kunskapsbank" },
              { name: article.title, href: path },
            ]}
            seoCanonical={settings.seoCanonical}
            className="mb-6"
          />
          <JsonLd data={schema} />

          <div className="mb-6">
            {article.category && <Badge variant="outline" className="mb-3">{article.category}</Badge>}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h1>
            {article.excerpt && <p className="text-lg text-gray-600">{article.excerpt}</p>}
            <p className="text-sm text-gray-400 mt-2">{formatDate(article.createdAt)}</p>
          </div>

          {article.content ? (
            <div className="prose-minodling" dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <Card><p className="text-gray-400 text-center py-8">Innehåll kommer snart.</p></Card>
          )}

          <div className="mt-10 pt-6 border-t border-gray-100">
            <Link href="/kunskapsbank" className="text-sm text-green-700 hover:text-green-800 transition-colors">
              ← Tillbaka till kunskapsbanken
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
