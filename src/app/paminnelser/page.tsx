export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CreateReminderForm } from "@/components/reminders/CreateReminderForm";
import { CompleteButton } from "@/components/reminders/CompleteButton";
import { DeleteReminderButton } from "@/components/reminders/DeleteReminderButton";
import { formatDate } from "@/lib/utils";
import { REMINDER_TYPES, REPEAT_OPTIONS } from "@/app/paminnelser/constants";

export const metadata: Metadata = {
  title: "Påminnelser – Minodling",
  description: "Hantera dina odlingspåminnelser för vattning, gödsling, skörd och mycket mer.",
};

interface Props {
  searchParams: Promise<{ tab?: string; type?: string }>;
}

// ── Hjälpfunktioner ───────────────────────────────────────────────
function getTypeInfo(value: string) {
  return REMINDER_TYPES.find((t) => t.value === value) ?? { emoji: "🔔", label: value, color: "gray" };
}

function getRepeatLabel(interval: string | null) {
  if (!interval) return null;
  return REPEAT_OPTIONS.find((r) => r.value === interval)?.label ?? null;
}

function daysUntil(date: Date, today: Date): number {
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function DueBadge({ date, today }: { date: Date; today: Date }) {
  const days = daysUntil(date, today);
  if (days < 0)  return <span className="text-xs font-semibold text-red-600">{Math.abs(days)}d förfallen</span>;
  if (days === 0) return <span className="text-xs font-semibold text-orange-600">Idag</span>;
  if (days === 1) return <span className="text-xs font-semibold text-amber-600">Imorgon</span>;
  if (days <= 7)  return <span className="text-xs font-medium text-amber-500">{days}d kvar</span>;
  return <span className="text-xs text-gray-400">{formatDate(date)}</span>;
}

type ReminderWithLinks = {
  id: string;
  title: string;
  reminderType: string;
  dueDate: Date;
  description: string | null;
  repeatInterval: string | null;
  isCompleted: boolean;
  diary: { id: string; title: string } | null;
  plant: { id: string; name: string; slug: string } | null;
};

function ReminderRow({ r, today, showComplete = true }: { r: ReminderWithLinks; today: Date; showComplete?: boolean }) {
  const typeInfo   = getTypeInfo(r.reminderType);
  const repeatLabel = getRepeatLabel(r.repeatInterval);
  const days       = daysUntil(r.dueDate, today);
  const isOverdue  = days < 0 && !r.isCompleted;

  return (
    <div className={`flex items-start gap-4 py-4 px-5 rounded-2xl transition-colors group ${
      isOverdue ? "bg-red-50/60 border border-red-100" :
      r.isCompleted ? "bg-gray-50/60 opacity-60" :
      "bg-white border border-gray-100 hover:border-gray-200"
    }`}>
      {/* Checkbox */}
      <div className="pt-0.5">
        <CompleteButton reminderId={r.id} isCompleted={r.isCompleted} />
      </div>

      {/* Emoji */}
      <div className="text-xl shrink-0 w-8 text-center">{typeInfo.emoji}</div>

      {/* Innehåll */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-semibold leading-tight ${r.isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>
              {r.title}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{typeInfo.label}</span>
              {repeatLabel && (
                <span className="flex items-center gap-0.5 text-xs text-indigo-600">
                  <RefreshCw className="h-3 w-3" /> {repeatLabel}
                </span>
              )}
              {r.diary && (
                <Link href={`/dagbok/${r.diary.id}`} className="text-xs text-sage-600 hover:underline">
                  📔 {r.diary.title}
                </Link>
              )}
              {r.plant && (
                <Link href={`/vaxtdatabas/${r.plant.slug}`} className="text-xs text-sage-600 hover:underline">
                  🌱 {r.plant.name}
                </Link>
              )}
            </div>
            {r.description && (
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{r.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <DueBadge date={r.dueDate} today={today} />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DeleteReminderButton reminderId={r.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Gruppera efter vecka ──────────────────────────────────────────
function groupByWeek(reminders: ReminderWithLinks[], today: Date) {
  const groups: { label: string; items: ReminderWithLinks[] }[] = [
    { label: "Idag",           items: [] },
    { label: "Imorgon",        items: [] },
    { label: "Denna veckan",   items: [] },
    { label: "Nästa vecka",    items: [] },
    { label: "Senare",         items: [] },
  ];

  for (const r of reminders) {
    const days = daysUntil(r.dueDate, today);
    if (days === 0)       groups[0].items.push(r);
    else if (days === 1)  groups[1].items.push(r);
    else if (days <= 7)   groups[2].items.push(r);
    else if (days <= 14)  groups[3].items.push(r);
    else                  groups[4].items.push(r);
  }
  return groups.filter((g) => g.items.length > 0);
}

// ── Sidan ─────────────────────────────────────────────────────────
export default async function PaminnelserPage({ searchParams }: Props) {
  const sp  = await searchParams;
  const tab  = sp.tab  ?? "upcoming";
  const typeFilter = sp.type ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/paminnelser");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  if (!profile) redirect("/dashboard");

  const navUser = { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseWhere = {
    userId:        profile.id,
    ...(typeFilter ? { reminderType: typeFilter } : {}),
  };

  const [upcoming, overdue, completed, plants, diaries, counts] = await Promise.all([
    prisma.reminder.findMany({
      where:   { ...baseWhere, isCompleted: false, dueDate: { gte: today } },
      orderBy: { dueDate: "asc" },
      include: { diary: { select: { id: true, title: true } }, plant: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.reminder.findMany({
      where:   { ...baseWhere, isCompleted: false, dueDate: { lt: today } },
      orderBy: { dueDate: "asc" },
      include: { diary: { select: { id: true, title: true } }, plant: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.reminder.findMany({
      where:   { ...baseWhere, isCompleted: true },
      orderBy: { dueDate: "desc" },
      take:    20,
      include: { diary: { select: { id: true, title: true } }, plant: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.plant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.gardenDiary.findMany({
      where:   { userId: profile.id },
      select:  { id: true, title: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.reminder.groupBy({
      by:    ["reminderType"],
      where: { userId: profile.id, isCompleted: false },
      _count: { id: true },
    }),
  ]);

  const upcomingGroups = groupByWeek(upcoming, today);
  const totalPending   = upcoming.length + overdue.length;

  const TABS = [
    { value: "upcoming",  label: "Kommande",  count: upcoming.length, icon: Clock },
    { value: "overdue",   label: "Förfallna", count: overdue.length,  icon: AlertTriangle },
    { value: "completed", label: "Avklarade", count: completed.length, icon: CheckCircle2 },
    { value: "new",       label: "Ny",        count: null,            icon: Bell },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-amber-50/80 to-cream-50 border-b border-amber-100/50 py-10">
          <div className="container-main">
            <Breadcrumbs items={[{ name: "Påminnelser", href: "/paminnelser" }]} className="mb-4" />
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 shrink-0">
                <Bell className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Påminnelser</h1>
                <p className="mt-1 text-gray-600 text-sm">
                  <span className="font-medium text-gray-800">{totalPending}</span> aktiva ·{" "}
                  {overdue.length > 0 && (
                    <span className="font-medium text-red-600">{overdue.length} förfallna</span>
                  )}
                  {overdue.length === 0 && (
                    <span className="text-green-600">Inga förfallna 🎉</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Huvud */}
            <div className="flex-1 min-w-0">

              {/* Tabs */}
              <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
                {TABS.map(({ value, label, count, icon: Icon }) => (
                  <Link
                    key={value}
                    href={`/paminnelser?tab=${value}${typeFilter ? `&type=${typeFilter}` : ""}`}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      tab === value
                        ? "border-amber-500 text-amber-700"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    {count !== null && count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        value === "overdue" && count > 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Typ-filter (chips) */}
              {tab !== "new" && (
                <div className="flex flex-wrap gap-2 mb-5">
                  <Link
                    href={`/paminnelser?tab=${tab}`}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      !typeFilter ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    Alla typer
                  </Link>
                  {REMINDER_TYPES.map((t) => {
                    const cnt = counts.find((c) => c.reminderType === t.value)?._count.id;
                    return (
                      <Link
                        key={t.value}
                        href={`/paminnelser?tab=${tab}&type=${t.value}`}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          typeFilter === t.value
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        {t.emoji} {t.label}
                        {cnt && cnt > 0 && <span className="opacity-70">({cnt})</span>}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* ── Kommande ── */}
              {tab === "upcoming" && (
                <div>
                  {upcoming.length === 0 ? (
                    <Card className="text-center py-14">
                      <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium mb-2">Inga kommande påminnelser</p>
                      <Link href="/paminnelser?tab=new" className="text-sm text-amber-600 hover:underline">
                        Skapa din första påminnelse →
                      </Link>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {upcomingGroups.map((group) => (
                        <div key={group.label}>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            {group.label}
                          </p>
                          <div className="space-y-2">
                            {group.items.map((r) => (
                              <ReminderRow key={r.id} r={r} today={today} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Förfallna ── */}
              {tab === "overdue" && (
                <div>
                  {overdue.length === 0 ? (
                    <Card className="text-center py-14">
                      <CheckCircle2 className="h-10 w-10 text-green-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Inga förfallna påminnelser – bra jobbat! 🎉</p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {overdue.map((r) => <ReminderRow key={r.id} r={r} today={today} />)}
                    </div>
                  )}
                </div>
              )}

              {/* ── Avklarade ── */}
              {tab === "completed" && (
                <div>
                  {completed.length === 0 ? (
                    <Card className="text-center py-14">
                      <p className="text-gray-400">Inga avklarade påminnelser ännu.</p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {completed.map((r) => <ReminderRow key={r.id} r={r} today={today} />)}
                    </div>
                  )}
                </div>
              )}

              {/* ── Ny påminnelse ── */}
              {tab === "new" && (
                <Card>
                  <h2 className="text-base font-semibold text-gray-900 mb-5">Skapa påminnelse</h2>
                  <CreateReminderForm plants={plants} diaries={diaries} />
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-5">

                {/* Snabb-skapa */}
                {tab !== "new" && (
                  <CreateReminderForm plants={plants} diaries={diaries} inline />
                )}

                {/* Typer-översikt */}
                <Card padding="md">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Aktiva per typ</h3>
                  <div className="space-y-2">
                    {REMINDER_TYPES.map((t) => {
                      const cnt = counts.find((c) => c.reminderType === t.value)?._count.id ?? 0;
                      return (
                        <div key={t.value} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 flex items-center gap-1.5">
                            <span>{t.emoji}</span> {t.label}
                          </span>
                          {cnt > 0 && (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {cnt}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>

              </div>
            </aside>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
