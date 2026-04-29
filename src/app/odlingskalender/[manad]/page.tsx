export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, SlidersHorizontal } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { TaskCard } from "@/components/calendar/TaskCard";
import { CalendarSuggestionForm } from "@/components/calendar/CalendarSuggestionForm";
import {
  MONTHS, TASK_TYPES, GROWING_ZONES, GROWING_TYPES, PLANT_CATEGORIES,
  SEASON_COLORS, monthFromSlug,
} from "@/lib/calendar";

interface Props {
  params: Promise<{ manad: string }>;
  searchParams: Promise<{
    typ?: string;
    zon?: string;
    odlingstyp?: string;
    kategori?: string;
  }>;
}

export async function generateStaticParams() {
  return MONTHS.map((m) => ({ manad: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { manad } = await params;
  const month = monthFromSlug(manad);
  if (!month) return { title: "Månad hittades inte" };
  const settings = await getSettings();
  const url = `${settings.seoCanonical}/odlingskalender/${manad}`;
  return {
    title: `Odlingskalender ${month.full} – Vad du ska göra`,
    description: `Odlingsuppgifter för ${month.full.toLowerCase()}: vad du ska så, plantera, skörda och sköta i din trädgård eller balkong under ${month.season.toLowerCase()}en.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Odlingskalender ${month.full}`,
      description: `Vad du bör göra i odlingen under ${month.full.toLowerCase()}.`,
      url,
      type: "website",
    },
  };
}

export default async function MonthCalendarPage({ params, searchParams }: Props) {
  const { manad } = await params;
  const sp = await searchParams;

  const month = monthFromSlug(manad);
  if (!month) notFound();

  const taskTypeFilter  = sp.typ       ?? "";
  const zoneFilter      = sp.zon       ?? "";
  const growingTypeFilter = sp.odlingstyp ?? "";
  const categoryFilter  = sp.kategori  ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [entries, profile] = await Promise.all([
    prisma.gardenCalendar.findMany({
      where: {
        month:  month.num,
        status: "published",
        ...(taskTypeFilter    ? { taskType:    taskTypeFilter }    : {}),
        ...(zoneFilter        ? { growingZone: zoneFilter }        : {}),
        ...(growingTypeFilter ? { growingType: growingTypeFilter } : {}),
        ...(categoryFilter    ? { category:    categoryFilter }    : {}),
      },
      orderBy: [
        // Frost warnings first
        { taskType: "asc" },
        { createdAt: "asc" },
      ],
      include: { suggester: { select: { username: true } } },
    }),
    user
      ? prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
        })
      : null,
  ]);

  const navUser = profile
    ? { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role }
    : null;

  // Adjacent months for navigation (wrap around)
  const allMonths  = [...MONTHS] as typeof MONTHS[number][];
  const prevMonth  = allMonths[month.num - 2] ?? allMonths[11]!;
  const nextMonth  = allMonths[month.num]     ?? allMonths[0]!;

  // Group entries by task type
  const grouped = TASK_TYPES.map((tt) => ({
    ...tt,
    items: entries.filter((e) => e.taskType === tt.value),
  })).filter((g) => g.items.length > 0);

  // Entries without a task type
  const untyped = entries.filter((e) => !e.taskType);

  const hasFilters = taskTypeFilter || zoneFilter || growingTypeFilter || categoryFilter;

  function filterUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (taskTypeFilter)    p.set("typ",        taskTypeFilter);
    if (zoneFilter)        p.set("zon",        zoneFilter);
    if (growingTypeFilter) p.set("odlingstyp", growingTypeFilter);
    if (categoryFilter)    p.set("kategori",   categoryFilter);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    const str = p.toString();
    return `/odlingskalender/${manad}${str ? `?${str}` : ""}`;
  }

  const gradientClass = SEASON_COLORS[month.season] ?? "from-sage-50 to-cream-50";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className={`bg-gradient-to-b ${gradientClass} border-b border-sage-100 py-10`}>
          <div className="container-main">
            <Breadcrumbs
              items={[
                { name: "Odlingskalender", href: "/odlingskalender" },
                { name: month.full, href: `/odlingskalender/${manad}` },
              ]}
              className="mb-4"
            />
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">
                  {month.season}
                </p>
                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">{month.full}</h1>
                <p className="mt-2 text-gray-600">
                  {entries.length === 0
                    ? "Inga uppgifter registrerade – kom snart!"
                    : `${entries.length} odlingsuppgifter`}
                </p>
              </div>

              {/* Månadsnavigation */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/odlingskalender/${prevMonth.slug}`}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {prevMonth.short}
                </Link>
                <Link
                  href="/odlingskalender"
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
                  title="Alla månader"
                >
                  <CalendarDays className="h-4 w-4" />
                </Link>
                <Link
                  href={`/odlingskalender/${nextMonth.slug}`}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  {nextMonth.short}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container-main py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar – filter */}
            <aside className="lg:w-56 shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrera
                  </h2>

                  {/* Uppgiftstyp */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-2">Uppgiftstyp</p>
                    <div className="space-y-1">
                      <Link
                        href={filterUrl({ typ: "" })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          !taskTypeFilter ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                        }`}
                      >
                        Alla typer
                      </Link>
                      {TASK_TYPES.map((t) => (
                        <Link
                          key={t.value}
                          href={filterUrl({ typ: t.value })}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            taskTypeFilter === t.value
                              ? "bg-green-600 text-white font-medium"
                              : "text-gray-700 hover:bg-sage-50"
                          }`}
                        >
                          <span>{t.icon}</span>
                          {t.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Odlingszon */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-2">Odlingszon</p>
                    <select
                      value={zoneFilter}
                      onChange={(e) => {
                        // Navigate on change — handled client side via form
                      }}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
                      name="zon"
                      id="zon-select"
                    >
                      <option value="">Alla zoner</option>
                      {GROWING_ZONES.map((z) => (
                        <option key={z} value={z}>Zon {z}</option>
                      ))}
                    </select>
                    {/* Zone links */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {GROWING_ZONES.map((z) => (
                        <Link
                          key={z}
                          href={filterUrl({ zon: zoneFilter === z ? "" : z })}
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                            zoneFilter === z
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {z}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Odlingstyp */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-2">Odlingstyp</p>
                    <div className="space-y-1">
                      <Link
                        href={filterUrl({ odlingstyp: "" })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          !growingTypeFilter ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                        }`}
                      >
                        Alla typer
                      </Link>
                      {GROWING_TYPES.map((t) => (
                        <Link
                          key={t.value}
                          href={filterUrl({ odlingstyp: t.value })}
                          className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            growingTypeFilter === t.value
                              ? "bg-green-600 text-white font-medium"
                              : "text-gray-700 hover:bg-sage-50"
                          }`}
                        >
                          {t.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Växtkategori */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-2">Växtkategori</p>
                    <div className="space-y-1">
                      <Link
                        href={filterUrl({ kategori: "" })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          !categoryFilter ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                        }`}
                      >
                        Alla kategorier
                      </Link>
                      {PLANT_CATEGORIES.map((c) => (
                        <Link
                          key={c}
                          href={filterUrl({ kategori: c })}
                          className={`block px-3 py-1.5 rounded-lg text-sm transition-colors truncate ${
                            categoryFilter === c
                              ? "bg-green-600 text-white font-medium"
                              : "text-gray-700 hover:bg-sage-50"
                          }`}
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <Link
                      href={`/odlingskalender/${manad}`}
                      className="block text-sm text-gray-400 hover:text-red-500 transition-colors"
                    >
                      × Rensa filter
                    </Link>
                  )}
                </div>
              </div>
            </aside>

            {/* Huvudinnehåll */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Inga resultat */}
              {entries.length === 0 && (
                <Card className="text-center py-16">
                  <CalendarDays className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-1">
                    {hasFilters
                      ? "Inga uppgifter matchar dina filter"
                      : `Inga uppgifter registrerade för ${month.full} än`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {hasFilters ? "Prova att ändra filtren" : "Bli den första att föreslå en uppgift!"}
                  </p>
                  {hasFilters && (
                    <Link
                      href={`/odlingskalender/${manad}`}
                      className="mt-4 inline-block text-sm font-medium text-green-700 hover:underline"
                    >
                      Rensa alla filter
                    </Link>
                  )}
                </Card>
              )}

              {/* Grupperade uppgifter */}
              {grouped.map((group) => (
                <div key={group.value}>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                    <span className="text-2xl">{group.icon}</span>
                    {group.label}
                    <span className="ml-auto text-sm font-normal text-gray-400">
                      {group.items.length} {group.items.length === 1 ? "uppgift" : "uppgifter"}
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {group.items.map((entry) => (
                      <TaskCard
                        key={entry.id}
                        title={entry.title}
                        taskType={entry.taskType}
                        category={entry.category}
                        description={entry.description}
                        growingZone={entry.growingZone}
                        growingType={entry.growingType}
                        isUserSuggested={entry.isUserSuggested}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Okategoriserade */}
              {untyped.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">📌 Övrigt</h2>
                  <div className="space-y-3">
                    {untyped.map((entry) => (
                      <TaskCard
                        key={entry.id}
                        title={entry.title}
                        taskType={entry.taskType}
                        category={entry.category}
                        description={entry.description}
                        growingZone={entry.growingZone}
                        growingType={entry.growingType}
                        isUserSuggested={entry.isUserSuggested}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Användarförslag */}
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <CalendarSuggestionForm defaultMonth={month.num} />
                ) : (
                  <div className="rounded-2xl border border-sage-200 bg-sage-50 px-5 py-4 text-sm text-gray-600">
                    💡{" "}
                    <Link href={`/auth/login?redirect=/odlingskalender/${manad}`} className="font-medium text-green-700 hover:underline">
                      Logga in
                    </Link>{" "}
                    för att föreslå ett kalendertips
                  </div>
                )}
              </div>

              {/* Månadsnavigering */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link
                  href={`/odlingskalender/${prevMonth.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {prevMonth.full}
                </Link>
                <Link
                  href={`/odlingskalender/${nextMonth.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  {nextMonth.full}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
