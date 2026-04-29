export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { glossaryMetadata, breadcrumbSchema, truncateDescription } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
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
    prisma.glossaryTerm.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!term) return { title: "Term hittades inte" };
  return glossaryMetadata(term, settings, `/ordlista/${slug}`);
}

export default async function OrdlistaTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [term, settings] = await Promise.all([
    prisma.glossaryTerm.findUnique({ where: { slug } }),
    getSettings(),
  ]);

  if (!term) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const navUser = user ? { id: user.id, username: user.email ?? "användare", displayName: null, avatarUrl: null } : null;

  const termSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.shortDescription ?? term.fullDescription ?? "",
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
        <div className="container-main py-10 max-w-3xl">
          <Breadcrumbs
            items={[
              { name: "Odlingsordlista", href: "/ordlista" },
              { name: term.term, href: `/ordlista/${slug}` },
            ]}
            seoCanonical={settings.seoCanonical}
          />
          <JsonLd data={termSchema} />

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <BookText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                {term.category && (
                  <Badge variant="outline" size="sm" className="mb-1">{term.category}</Badge>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{term.term}</h1>
              </div>
            </div>

            {term.shortDescription && (
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">{term.shortDescription}</p>
            )}

            {term.fullDescription && (
              <Card className="mt-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Förklaring</h2>
                <div
                  className="prose prose-stone max-w-none text-gray-700 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: term.fullDescription }}
                />
              </Card>
            )}

            {term.imageUrl && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100">
                <img
                  src={term.imageUrl}
                  alt={`${term.term} – odlingsordlista`}
                  className="w-full object-cover max-h-64"
                />
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <a href="/ordlista" className="text-sm text-green-700 hover:text-green-800 transition-colors">
                ← Tillbaka till ordlistan
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
