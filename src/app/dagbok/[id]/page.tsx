export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, Calendar, Edit2, Globe, Lock, Leaf } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DiaryEntryForm, ENTRY_TYPES } from "@/components/diary/DiaryEntryForm";
import { ReminderForm } from "@/components/diary/ReminderForm";
import { ReminderToggle } from "@/components/diary/ReminderToggle";
import { DeleteEntryButton } from "@/components/diary/DeleteEntryButton";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const diary = await prisma.gardenDiary.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: diary ? `${diary.title} – Dagbok` : "Dagbok" };
}

export default async function DiaryDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?redirect=/dagbok/${id}`);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  if (!profile) redirect("/dashboard");

  const navUser = { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role };

  const diary = await prisma.gardenDiary.findUnique({
    where: { id },
    include: {
      plant:    { select: { name: true, slug: true, imageUrl: true } },
      owner:    { select: { id: true } },
      entries:  { orderBy: { date: "desc" } },
      reminders: {
        orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }],
      },
    },
  });

  if (!diary) notFound();

  // Only owner can view (unless isPublic — for future)
  if (diary.userId !== profile.id) notFound();

  const isOwner = diary.userId === profile.id;
  const today   = new Date();
  today.setHours(0, 0, 0, 0);

  // Group entries by year-month for timeline display
  const entriesByMonth: Record<string, typeof diary.entries> = {};
  for (const entry of diary.entries) {
    const key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, "0")}`;
    if (!entriesByMonth[key]) entriesByMonth[key] = [];
    entriesByMonth[key].push(entry);
  }

  const pendingReminders    = diary.reminders.filter((r) => !r.isCompleted);
  const completedReminders  = diary.reminders.filter((r) => r.isCompleted);
  const overdueReminders    = pendingReminders.filter((r) => r.dueDate < today);
  const upcomingReminders   = pendingReminders.filter((r) => r.dueDate >= today);

  const plantName = diary.plant?.name ?? diary.customPlantName ?? diary.title;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <div className="relative">
          {(diary.imageUrl || diary.plant?.imageUrl) ? (
            <div className="h-52 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(diary.imageUrl ?? diary.plant?.imageUrl)!}
                alt={plantName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="h-40 bg-gradient-to-br from-sage-100 to-green-100 flex items-center justify-center">
              <span className="text-7xl">🌱</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-8">
            <div className="container-main">
              <Link
                href="/dagbok"
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4" /> Dagboken
              </Link>
            </div>
          </div>
        </div>

        <div className="container-main py-6">
          {/* Titel-rad */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{diary.title}</h1>
                {diary.isPublic
                  ? <Badge variant="outline" size="sm"><Globe className="h-3 w-3 mr-1" />Publik</Badge>
                  : <Badge variant="default" size="sm"><Lock className="h-3 w-3 mr-1" />Privat</Badge>}
              </div>
              {diary.plant ? (
                <Link href={`/vaxtdatabas/${diary.plant.slug}`} className="text-sm text-sage-600 hover:underline flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" /> {plantName}
                </Link>
              ) : (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" /> {plantName}
                </p>
              )}
            </div>
            {isOwner && (
              <Link
                href={`/dagbok/${diary.id}/redigera`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="h-4 w-4" /> Redigera
              </Link>
            )}
          </div>

          {/* Viktiga datum */}
          {(diary.sowingDate || diary.plantingDate || diary.harvestDate) && (
            <div className="flex flex-wrap gap-3 mb-6">
              {diary.sowingDate && (
                <div className="flex items-center gap-2 px-3 py-2 bg-lime-50 border border-lime-200 rounded-xl text-sm">
                  <span>🌱</span>
                  <div>
                    <p className="text-xs text-lime-600 font-medium">Sådd</p>
                    <p className="text-lime-800 font-semibold">{formatDate(diary.sowingDate)}</p>
                  </div>
                </div>
              )}
              {diary.plantingDate && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm">
                  <span>🪴</span>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Plantering</p>
                    <p className="text-green-800 font-semibold">{formatDate(diary.plantingDate)}</p>
                  </div>
                </div>
              )}
              {diary.harvestDate && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                  <span>🌾</span>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Planerad skörd</p>
                    <p className="text-amber-800 font-semibold">{formatDate(diary.harvestDate)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Allmänna anteckningar */}
          {diary.notes && (
            <Card padding="md" className="mb-6 bg-sage-50 border-sage-100">
              <p className="text-sm text-sage-800 whitespace-pre-wrap leading-relaxed">{diary.notes}</p>
            </Card>
          )}

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Tidslinje */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tidslinje
                  {diary.entries.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">({diary.entries.length} händelser)</span>
                  )}
                </h2>
                {isOwner && <DiaryEntryForm diaryId={diary.id} />}
              </div>

              {diary.entries.length === 0 ? (
                <Card className="text-center py-12">
                  <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-2">Inga händelser än</p>
                  <p className="text-sm text-gray-400">Lägg till din första händelse för att starta tidslinjen</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(entriesByMonth).map(([monthKey, monthEntries]) => {
                    const [year, month] = monthKey.split("-");
                    const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString("sv-SE", {
                      month: "long", year: "numeric",
                    });
                    return (
                      <div key={monthKey}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <span className="h-px flex-1 bg-gray-200" />
                          {monthName}
                          <span className="h-px flex-1 bg-gray-200" />
                        </p>
                        <div className="space-y-3">
                          {monthEntries.map((entry) => {
                            const entryType = ENTRY_TYPES.find((t) => t.value === entry.type) ?? ENTRY_TYPES[3];
                            return (
                              <div key={entry.id} className="flex gap-3 group">
                                {/* Ikon */}
                                <div className="flex flex-col items-center shrink-0">
                                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-base ${entryType.color}`}>
                                    {entryType.emoji}
                                  </div>
                                  <div className="w-px flex-1 bg-gray-200 mt-1" />
                                </div>

                                {/* Innehåll */}
                                <div className="flex-1 min-w-0 pb-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className={`text-sm font-semibold ${entryType.color.split(" ")[0]}`}>
                                        {entryType.label}
                                      </p>
                                      <p className="text-xs text-gray-400 mb-1">{formatDate(entry.date)}</p>
                                    </div>
                                    {isOwner && (
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DeleteEntryButton entryId={entry.id} diaryId={diary.id} />
                                      </div>
                                    )}
                                  </div>

                                  {entry.notes && (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-2">
                                      {entry.notes}
                                    </p>
                                  )}

                                  {entry.imageUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={entry.imageUrl}
                                      alt="Bild"
                                      className="rounded-xl border border-gray-200 max-h-56 object-cover"
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar: Påminnelser */}
            <aside className="lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-5">
                <Card padding="md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Påminnelser</h3>
                      {overdueReminders.length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                          {overdueReminders.length} förfallna
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Förfallna */}
                  {overdueReminders.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Förfallna</p>
                      {overdueReminders.map((r) => (
                        <div key={r.id} className="flex items-start gap-3 py-2 px-3 bg-red-50 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 leading-tight">{r.title}</p>
                            <p className="text-xs text-red-600">{formatDate(r.dueDate)}</p>
                            {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
                          </div>
                          <ReminderToggle reminderId={r.id} diaryId={diary.id} isCompleted={false} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Kommande */}
                  {upcomingReminders.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {overdueReminders.length > 0 && (
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Kommande</p>
                      )}
                      {upcomingReminders.map((r) => {
                        const daysLeft = Math.ceil((r.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <div key={r.id} className="flex items-start gap-3 py-2">
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                              daysLeft <= 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {daysLeft === 0 ? "Idag" : daysLeft === 1 ? "Imorgon" : `${daysLeft}d`}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 leading-tight">{r.title}</p>
                              <p className="text-xs text-gray-400">{formatDate(r.dueDate)}</p>
                              {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                            </div>
                            <ReminderToggle reminderId={r.id} diaryId={diary.id} isCompleted={false} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {pendingReminders.length === 0 && (
                    <p className="text-sm text-gray-400 mb-4">Inga aktiva påminnelser.</p>
                  )}

                  {/* Avklarade */}
                  {completedReminders.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Avklarade</p>
                      {completedReminders.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-center gap-3 py-1.5 opacity-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 line-through leading-tight">{r.title}</p>
                          </div>
                          <ReminderToggle reminderId={r.id} diaryId={diary.id} isCompleted={true} />
                        </div>
                      ))}
                    </div>
                  )}

                  {isOwner && <ReminderForm diaryId={diary.id} />}
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
