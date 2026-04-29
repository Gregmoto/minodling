export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Sprout } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ExchangeCard } from "@/components/frobyte/ExchangeCard";
import { EXCHANGE_TYPES, CATEGORIES } from "./constants";

export const metadata: Metadata = {
  title: "Fröbyte & Plantbyte – Dela med dig av din odling",
  description: "Byt frön, ge bort plantor eller sälj sticklingar. Hitta ovanliga sorter och träffa odlare nära dig.",
};

export default async function FrobyteListPage({
  searchParams,
}: {
  searchParams: Promise<{ typ?: string; kategori?: string; plats?: string; q?: string }>;
}) {
  const p   = await searchParams;
  const typ      = p.typ      ?? "";
  const kategori = p.kategori ?? "";
  const plats    = p.plats    ?? "";
  const q        = p.q        ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await import("@/lib/prisma").then((m) =>
    m.default.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
    })
  ) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const exchanges = await prisma.seedExchange.findMany({
    where: {
      AND: [
        { status: { not: "closed" } },
        typ      ? { exchangeType: typ }                                          : {},
        kategori ? { category: kategori }                                        : {},
        plats    ? { location: { contains: plats, mode: "insensitive" } }        : {},
        q        ? { OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { variety:     { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ]} : {},
      ],
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 60,
    select: {
      id: true, title: true, description: true, variety: true,
      exchangeType: true, category: true, location: true, price: true,
      imageUrl: true, status: true, createdAt: true,
      owner: { select: { username: true, avatarUrl: true } },
    },
  });

  // Unika platser för platsfilter
  const locations = await prisma.seedExchange.findMany({
    where: { status: { not: "closed" }, location: { not: null } },
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });
  const uniqueLocations = locations.map((l) => l.location!).filter(Boolean);

  const active   = exchanges.filter((e) => e.status === "active").length;
  const reserved = exchanges.filter((e) => e.status === "reserved").length;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-50 to-green-50 border-b border-gray-100 py-10">
          <div className="container-main">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-green-700" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Fröbyte & Plantbyte</h1>
                </div>
                <p className="text-gray-500 max-w-xl">
                  Byt frön, ge bort plantor, sälj sticklingar eller sök ovanliga sorter. {active} aktiva annonser.
                </p>
              </div>
              {user ? (
                <Link href="/frobyte/ny"
                  className="flex items-center gap-2 px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors shrink-0 self-start">
                  <Plus className="h-4 w-4" /> Lägg upp annons
                </Link>
              ) : (
                <Link href="/auth/logga-in"
                  className="px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors shrink-0 self-start">
                  Logga in för att annonsera
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container-main py-8">
          <Breadcrumbs items={[{ name: "Fröbyte & Plantbyte", href: "/frobyte" }]} className="mb-6" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar med filter */}
            <aside className="lg:w-56 shrink-0 space-y-6">

              {/* Sök */}
              <form method="get">
                <input name="q" defaultValue={q}
                  placeholder="Sök sort, rubrik..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
                />
                {typ      && <input type="hidden" name="typ"      value={typ} />}
                {kategori && <input type="hidden" name="kategori" value={kategori} />}
                {plats    && <input type="hidden" name="plats"    value={plats} />}
              </form>

              {/* Annonstyp */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Typ</p>
                <div className="space-y-1">
                  <Link href={buildUrl({ kategori, plats, q })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!typ ? "bg-sage-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    Alla typer
                  </Link>
                  {EXCHANGE_TYPES.map((t) => (
                    <Link key={t.value} href={buildUrl({ typ: t.value, kategori, plats, q })}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${typ === t.value ? "bg-sage-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      {t.emoji} {t.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Kategori */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kategori</p>
                <div className="space-y-1">
                  <Link href={buildUrl({ typ, plats, q })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!kategori ? "bg-amber-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    Alla kategorier
                  </Link>
                  {CATEGORIES.map((c) => (
                    <Link key={c.value} href={buildUrl({ typ, kategori: c.value, plats, q })}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${kategori === c.value ? "bg-amber-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      {c.emoji} {c.value}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Plats */}
              {uniqueLocations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Plats</p>
                  <div className="space-y-1">
                    <Link href={buildUrl({ typ, kategori, q })}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!plats ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      Hela Sverige
                    </Link>
                    {uniqueLocations.slice(0, 10).map((loc) => (
                      <Link key={loc} href={buildUrl({ typ, kategori, plats: loc, q })}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${plats === loc ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                        📍 {loc}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Annonserna */}
            <div className="flex-1 min-w-0">
              {exchanges.length === 0 ? (
                <div className="text-center py-20">
                  <Sprout className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Inga annonser hittades.</p>
                  {user && (
                    <Link href="/frobyte/ny" className="text-sm text-green-700 hover:underline">
                      Lägg upp den första annonsen →
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-4">{exchanges.length} annonser</p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {exchanges.map((e) => (
                      <ExchangeCard key={e.id} exchange={e} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return `/frobyte${qs ? `?${qs}` : ""}`;
}
