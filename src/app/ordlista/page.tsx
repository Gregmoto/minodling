export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookText, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Odlingsordlista – Förstå odlingstermer",
  description: "Lär dig odlingstermer och begrepp. Vår ordlista förklarar allt från omskolning till täckodling på enkelt svenska.",
};

export default async function OrdlistaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; bokstav?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const bokstav = params.bokstav ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const terms = await prisma.glossaryTerm.findMany({
    where: {
      AND: [
        q ? { term: { contains: q, mode: "insensitive" } } : {},
        bokstav ? { term: { startsWith: bokstav, mode: "insensitive" } } : {},
      ],
    },
    orderBy: { term: "asc" },
    select: { slug: true, term: true, shortDescription: true, category: true },
  }).catch(() => []);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");
  const navUser = user ? { id: user.id, username: user.email ?? "användare", displayName: null, avatarUrl: null } : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-10">
          <Breadcrumbs items={[{ name: "Odlingsordlista", href: "/ordlista" }]} />

          <div className="mt-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <BookText className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Odlingsordlista</h1>
            </div>
            <p className="text-gray-500">
              Förstå odlingstermer och begrepp – från nybörjare till erfaren odlare.
            </p>
          </div>

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
            </div>
          </form>

          {/* Alfabetsfilter */}
          <div className="flex flex-wrap gap-1 mb-8">
            <Link
              href="/ordlista"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                !bokstav ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Alla
            </Link>
            {alphabet.map((b) => (
              <Link
                key={b}
                href={`/ordlista?bokstav=${b}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  bokstav === b ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {b}
              </Link>
            ))}
          </div>

          {terms.length === 0 ? (
            <div className="text-center py-16">
              <BookText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Inga termer hittades.</p>
            </div>
          ) : (
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
