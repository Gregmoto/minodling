export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, Sprout, Star, SlidersHorizontal } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Växtdatabas – Odlingsguider för svenska växter",
  description:
    "Utforska vår växtdatabas med odlingsguider för svenska köksväxter, blommor och örter. Hitta såningstider, skötselråd och tips.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; kategori?: string; svarighetsgrad?: string }>;
}

const CATEGORIES = [
  "Grönsaker", "Rotfrukter", "Örter", "Frukt", "Bär",
  "Blommor", "Lök & vitlök", "Baljväxter", "Sallad & bladgrönt",
];

const DIFFICULTY_OPTIONS = [
  { value: "easy",   label: "Lätt",   stars: 1 },
  { value: "medium", label: "Medel",  stars: 3 },
  { value: "hard",   label: "Svår",   stars: 5 },
];

/** Extraherar bara månadsintervallet ur fritext. Kräver ordgräns så "Blommar" inte triggar. */
function extractDateRange(text: string | null): string | null {
  if (!text) return null;
  const MONTHS = "jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec";
  const re = new RegExp(`(?<![a-zåäö])(${MONTHS})[a-z]*\\s*[–\\-]\\s*(${MONTHS})[a-z]*`, "i");
  const m = text.match(re);
  return m ? m[0] : null;
}

function DifficultyStars({ level }: { level: string | null }) {
  if (!level) return null;
  const map: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
  const count = map[level] ?? 0;
  return (
    <div className="flex items-center gap-0.5" title={
      level === "easy" ? "Lätt" : level === "medium" ? "Medel" : "Svår"
    }>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= count ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function difficultyVariant(level?: string | null): "success" | "warning" | "danger" | "default" {
  if (!level) return "default";
  if (level === "easy")   return "success";
  if (level === "medium") return "warning";
  if (level === "hard")   return "danger";
  return "default";
}

function difficultyLabel(level?: string | null) {
  if (level === "easy")   return "Lätt";
  if (level === "medium") return "Medel";
  if (level === "hard")   return "Svår";
  return level ?? "";
}

export default async function VaxtdatabasePage({ searchParams }: PageProps) {
  const params      = await searchParams;
  const q           = params.q?.trim() ?? "";
  const kategori    = params.kategori ?? "";
  const svarighets  = params.svarighetsgrad ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [plants, allCategories, navUser] = await Promise.all([
    prisma.plant.findMany({
      where: {
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { latinName: { contains: q, mode: "insensitive" as const } },
          ],
        } : {}),
        ...(kategori   ? { category: kategori }          : {}),
        ...(svarighets ? { difficultyLevel: svarighets } : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true, slug: true, name: true, latinName: true, imageUrl: true,
        category: true, difficultyLevel: true, sowingPeriod: true, harvestPeriod: true,
        _count: { select: { tips: true } },
      },
    }).catch(() => []),
    prisma.plant.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }).catch(() => []),
    getNavUser(user?.id),
  ]);

  const hasFilters = q || kategori || svarighets;

  // Build a URL helper that preserves other params
  function filterUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (q)          p.set("q",              q);
    if (kategori)   p.set("kategori",       kategori);
    if (svarighets) p.set("svarighetsgrad", svarighets);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    const str = p.toString();
    return `/vaxtdatabas${str ? `?${str}` : ""}`;
  }

  const categoryList = [
    ...new Set([
      ...CATEGORIES,
      ...allCategories.map((c) => c.category).filter(Boolean) as string[],
    ]),
  ].sort();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
          <div className="container-main">
            <Breadcrumbs items={[{ name: "Växtdatabas", href: "/vaxtdatabas" }]} className="mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Växtdatabas</h1>
            <p className="mt-2 text-gray-600 max-w-xl">
              Odlingsguider för svenska köksväxter, blommor och örter – med såningstider,
              skötselråd och tips från odlare.
            </p>

            {/* Sök */}
            <form method="GET" className="mt-6 flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Sök på växt eller latinskt namn…"
                  className="w-full rounded-xl border border-sage-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              {kategori   && <input type="hidden" name="kategori" value={kategori} />}
              {svarighets && <input type="hidden" name="svarighetsgrad" value={svarighets} />}
              <button
                type="submit"
                className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
              >
                Sök
              </button>
            </form>
          </div>
        </section>

        <div className="container-main py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar – filter */}
            <aside className="lg:w-56 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Kategori */}
                <div>
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Kategori
                  </h2>
                  <div className="space-y-1">
                    <Link
                      href={filterUrl({ kategori: "" })}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        !kategori
                          ? "bg-green-600 text-white font-medium"
                          : "text-gray-700 hover:bg-sage-50"
                      }`}
                    >
                      Alla kategorier
                    </Link>
                    {categoryList.map((cat) => (
                      <Link
                        key={cat}
                        href={filterUrl({ kategori: cat })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          kategori === cat
                            ? "bg-green-600 text-white font-medium"
                            : "text-gray-700 hover:bg-sage-50"
                        }`}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Svårighetsgrad */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Svårighetsgrad</h2>
                  <div className="space-y-1">
                    <Link
                      href={filterUrl({ svarighetsgrad: "" })}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        !svarighets
                          ? "bg-green-600 text-white font-medium"
                          : "text-gray-700 hover:bg-sage-50"
                      }`}
                    >
                      Alla nivåer
                    </Link>
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <Link
                        key={opt.value}
                        href={filterUrl({ svarighetsgrad: opt.value })}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          svarighets === opt.value
                            ? "bg-green-600 text-white font-medium"
                            : "text-gray-700 hover:bg-sage-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i <= opt.stars / 2
                                  ? svarighets === opt.value
                                    ? "fill-white text-white"
                                    : "fill-amber-400 text-amber-400"
                                  : svarighets === opt.value
                                  ? "text-white/40"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Rensa filter */}
                {hasFilters && (
                  <Link
                    href="/vaxtdatabas"
                    className="block text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    × Rensa alla filter
                  </Link>
                )}
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {/* Status */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">
                  {plants.length === 0
                    ? "Inga växter hittades"
                    : `${plants.length} ${plants.length === 1 ? "växt" : "växter"}`}
                  {q && ` för "${q}"`}
                  {kategori && ` i ${kategori}`}
                </p>
              </div>

              {plants.length === 0 ? (
                <Card className="text-center py-20">
                  <Sprout className="h-14 w-14 text-sage-200 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-600 mb-2">
                    {hasFilters ? "Inga växter matchade dina filter" : "Databasen byggs upp – kom snart!"}
                  </h2>
                  <p className="text-sm text-gray-400 mb-4 max-w-sm mx-auto">
                    {hasFilters
                      ? "Prova ett annat sökord eller filterkombination."
                      : "Vi arbetar med att fylla databasen med odlingsguider."}
                  </p>
                  {hasFilters && (
                    <Link href="/vaxtdatabas" className="text-sm font-medium text-green-700 hover:underline">
                      Visa alla växter
                    </Link>
                  )}
                </Card>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {plants.map((plant) => (
                    <Link key={plant.id} href={`/vaxtdatabas/${plant.slug}`} className="group block h-full">
                      <Card hover padding="none" className="overflow-hidden h-full flex flex-col">
                        {/* Bild */}
                        <div className="relative h-44 w-full bg-sage-50 shrink-0">
                          {plant.imageUrl ? (
                            <Image
                              src={plant.imageUrl}
                              alt={plant.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Sprout className="h-12 w-12 text-sage-200" />
                            </div>
                          )}
                          {/* Kategori-chip */}
                          {plant.category && (
                            <span className="absolute top-2 left-2 bg-black/40 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {plant.category}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col gap-2 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="font-semibold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
                              {plant.name}
                            </h2>
                            {plant.difficultyLevel && (
                              <Badge variant={difficultyVariant(plant.difficultyLevel)} size="sm">
                                {difficultyLabel(plant.difficultyLevel)}
                              </Badge>
                            )}
                          </div>

                          {plant.latinName && (
                            <p className="text-xs text-gray-400 italic">{plant.latinName}</p>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-2 min-h-[2rem]">
                            <div className="flex flex-col gap-0.5 text-xs text-gray-400">
                              {(() => {
                                const sow     = extractDateRange(plant.sowingPeriod);
                                const harvest = extractDateRange(plant.harvestPeriod);
                                return (
                                  <>
                                    {sow     && <span>🌱 Sås: {sow}</span>}
                                    {harvest && <span>🌾 Skörd: {harvest}</span>}
                                  </>
                                );
                              })()}
                            </div>
                            {plant.difficultyLevel && (
                              <DifficultyStars level={plant.difficultyLevel} />
                            )}
                          </div>

                          {plant._count.tips > 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              💡 {plant._count.tips} {plant._count.tips === 1 ? "tips" : "tips"} från odlare
                            </p>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
