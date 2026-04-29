export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, MessageCircle, CheckCircle2, TrendingUp, Clock, Search, Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Frågor & Svar – Odlingshjälp från svenska odlare",
  description:
    "Få svar på dina odlingsfrågor från erfarna svenska odlare. Ställ en fråga om växtproblem, skadedjur, jord, beskärning eller nybörjartips.",
};

interface Props {
  searchParams: Promise<{
    sort?: string;
    kategori?: string;
    q?: string;
  }>;
}

const CATEGORIES = [
  "Växtproblem", "Skadedjur", "Jord & gödsel", "Växthus",
  "Balkongodling", "Inomhusväxter", "Grönsaker",
  "Kryddor", "Frukt & bär", "Nybörjarfrågor",
];

const SORT_OPTIONS = [
  { value: "new",       label: "Nyaste",     icon: Clock },
  { value: "popular",   label: "Populärast", icon: TrendingUp },
  { value: "unanswered",label: "Obesvarade", icon: HelpCircle },
];

export default async function FragorPage({ searchParams }: Props) {
  const sp       = await searchParams;
  const sort     = sp.sort     ?? "new";
  const kategori = sp.kategori ?? "";
  const q        = sp.q?.trim() ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const where = {
    status: { in: ["open", "answered"] as string[] },
    ...(kategori ? { category: kategori } : {}),
    ...(sort === "unanswered" ? { answersCount: 0 } : {}),
    ...(q ? {
      OR: [
        { title:   { contains: q, mode: "insensitive" as const } },
        { content: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [questions, categoryCounts, profile, totalCounts] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy:
        sort === "popular"
          ? [{ answersCount: "desc" }, { viewsCount: "desc" }]
          : { createdAt: "desc" },
      take: 25,
      include: {
        author: { select: { username: true, fullName: true, avatarUrl: true } },
      },
    }),
    prisma.question.groupBy({
      by: ["category"],
      where: { status: { in: ["open", "answered"] }, category: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    user
      ? prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
        })
      : null,
    prisma.question.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const navUser = profile
    ? { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role }
    : null;

  const openCount      = totalCounts.find((c) => c.status === "open")?._count.id     ?? 0;
  const answeredCount  = totalCounts.find((c) => c.status === "answered")?._count.id ?? 0;

  function filterUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (sort     !== "new") p.set("sort",     sort);
    if (kategori)           p.set("kategori", kategori);
    if (q)                  p.set("q",        q);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    return `/fragor${p.toString() ? `?${p}` : ""}`;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50/60 to-cream-50 border-b border-indigo-100/50 py-10">
          <div className="container-main">
            <Breadcrumbs items={[{ name: "Frågor & Svar", href: "/fragor" }]} className="mb-4" />
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 shrink-0">
                  <HelpCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Frågor & Svar</h1>
                  <p className="mt-1 text-gray-600 text-sm">
                    <span className="font-medium text-gray-800">{openCount}</span> öppna ·{" "}
                    <span className="font-medium text-gray-800">{answeredCount}</span> besvarade
                  </p>
                </div>
              </div>
              {user && (
                <Link
                  href="/fragor/ny"
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Ställ en fråga
                </Link>
              )}
            </div>

            {/* Sök */}
            <form method="GET" className="mt-5 flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Sök bland frågor..."
                  className="w-full rounded-xl border border-indigo-100 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>
              {sort     && <input type="hidden" name="sort"     value={sort} />}
              {kategori && <input type="hidden" name="kategori" value={kategori} />}
              <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
                Sök
              </button>
            </form>
          </div>
        </section>

        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <aside className="lg:w-56 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Sortering */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sortera</p>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <Link
                          key={opt.value}
                          href={filterUrl({ sort: opt.value === "new" ? "" : opt.value })}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            sort === opt.value
                              ? "bg-indigo-600 text-white font-medium"
                              : "text-gray-700 hover:bg-indigo-50"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {opt.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Kategorier */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kategorier</p>
                  <div className="space-y-1">
                    <Link
                      href={filterUrl({ kategori: "" })}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        !kategori ? "bg-indigo-600 text-white font-medium" : "text-gray-700 hover:bg-indigo-50"
                      }`}
                    >
                      <span>Alla kategorier</span>
                    </Link>
                    {CATEGORIES.map((cat) => {
                      const count = categoryCounts.find((c) => c.category === cat)?._count.id;
                      return (
                        <Link
                          key={cat}
                          href={filterUrl({ kategori: cat })}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            kategori === cat
                              ? "bg-indigo-600 text-white font-medium"
                              : "text-gray-700 hover:bg-indigo-50"
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          {count && <span className="text-xs opacity-60 ml-1">{count}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {!user && (
                  <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-center">
                    <p className="text-sm text-indigo-800 mb-3 font-medium">Vet du svaret?</p>
                    <Link href="/auth/register" className="block w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors text-center">
                      Skapa konto
                    </Link>
                  </div>
                )}
              </div>
            </aside>

            {/* Frågelista */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {questions.length === 0 ? "Inga frågor" : `${questions.length} frågor`}
                  {q && ` för "${q}"`}
                  {kategori && ` i ${kategori}`}
                </p>
              </div>

              {questions.length === 0 ? (
                <Card className="text-center py-16">
                  <HelpCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">
                    {sort === "unanswered" ? "Inga obesvarade frågor – bra jobbat!" : "Inga frågor hittades"}
                  </p>
                  {user && (
                    <Link href="/fragor/ny" className="mt-3 inline-block text-sm font-medium text-green-700 hover:underline">
                      Ställ den första frågan →
                    </Link>
                  )}
                </Card>
              ) : (
                <div className="space-y-3">
                  {questions.map((q_item) => (
                    <Link key={q_item.id} href={`/fragor/${q_item.slug}`} className="block group">
                      <Card hover padding="md">
                        <div className="flex items-start gap-4">
                          {/* Svarsstatus */}
                          <div className="shrink-0 flex flex-col items-center gap-1 w-12 text-center">
                            <div className={`text-lg font-bold ${
                              q_item.answersCount > 0 && q_item.bestAnswerId
                                ? "text-green-600"
                                : q_item.answersCount > 0
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}>
                              {q_item.answersCount}
                            </div>
                            <div className="text-xs text-gray-400">svar</div>
                            {q_item.bestAnswerId && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>

                          {/* Innehåll */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-1.5">
                              {q_item.category && (
                                <Badge variant="outline" size="sm">{q_item.category}</Badge>
                              )}
                              {q_item.bestAnswerId && (
                                <Badge variant="success" size="sm">✓ Besvarad</Badge>
                              )}
                            </div>
                            <h2 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-2 mb-1.5">
                              {q_item.title}
                            </h2>
                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{q_item.content}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                              <Avatar src={q_item.author.avatarUrl} fallback={q_item.author.username} size="xs" />
                              <span className="font-medium text-gray-600">
                                {q_item.author.fullName ?? q_item.author.username}
                              </span>
                              <span>·</span>
                              <span>{formatRelativeDate(q_item.createdAt)}</span>
                              {q_item.viewsCount > 0 && (
                                <>
                                  <span>·</span>
                                  <span>{q_item.viewsCount} visningar</span>
                                </>
                              )}
                            </div>
                          </div>
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
