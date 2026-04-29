export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Plus, Bell, Leaf, Calendar, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Min odlingsdagbok – Minodling",
  description: "Följ din odlings utveckling, loggföra händelser och sätt påminnelser för dina växter.",
};

function statusColor(status: string) {
  if (status === "growing")   return "bg-green-100 text-green-700";
  if (status === "harvested") return "bg-amber-100 text-amber-700";
  if (status === "dormant")   return "bg-gray-100 text-gray-600";
  return "bg-blue-100 text-blue-700";
}

function statusLabel(status: string) {
  if (status === "growing")   return "Växer";
  if (status === "harvested") return "Skördad";
  if (status === "dormant")   return "Vilar";
  return status;
}

export default async function DagbokPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dagbok");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  });
  if (!profile) redirect("/dashboard");

  const navUser = { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [diaries, upcomingReminders] = await Promise.all([
    prisma.gardenDiary.findMany({
      where: { userId: profile.id },
      orderBy: { updatedAt: "desc" },
      include: {
        plant:    { select: { name: true, slug: true } },
        entries:  { orderBy: { date: "desc" }, take: 1 },
        _count:   { select: { entries: true, reminders: true } },
      },
    }),
    prisma.reminder.findMany({
      where: {
        userId:      profile.id,
        isCompleted: false,
        dueDate:     { gte: today, lte: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { dueDate: "asc" },
      take:    5,
      include: { diary: { select: { id: true, title: true } } },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-sage-50/80 to-cream-50 border-b border-sage-100/50 py-10">
          <div className="container-main">
            <Breadcrumbs items={[{ name: "Min dagbok", href: "/dagbok" }]} className="mb-4" />
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 shrink-0">
                  <BookOpen className="h-6 w-6 text-sage-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Min odlingsdagbok</h1>
                  <p className="mt-1 text-gray-600 text-sm">
                    <span className="font-medium text-gray-800">{diaries.length}</span> växter spåras
                  </p>
                </div>
              </div>
              <Link
                href="/dagbok/ny"
                className="flex items-center gap-2 px-4 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Lägg till växt
              </Link>
            </div>
          </div>
        </section>

        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Dagbokskort */}
            <div className="flex-1 min-w-0">
              {diaries.length === 0 ? (
                <Card className="text-center py-16">
                  <Leaf className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">Inga växter i dagboken ännu</p>
                  <p className="text-sm text-gray-400 mb-6">Börja spåra din odlings utveckling</p>
                  <Link
                    href="/dagbok/ny"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Lägg till din första växt
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {diaries.map((diary) => {
                    const plantName = diary.plant?.name ?? diary.customPlantName ?? diary.title;
                    const lastEntry = diary.entries[0];
                    return (
                      <Link key={diary.id} href={`/dagbok/${diary.id}`} className="block group">
                        <Card hover padding="none" className="overflow-hidden">
                          {/* Omslagsbild */}
                          {diary.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={diary.imageUrl}
                              alt={plantName}
                              className="w-full h-36 object-cover"
                            />
                          ) : (
                            <div className="w-full h-36 bg-gradient-to-br from-sage-100 to-green-100 flex items-center justify-center">
                              <span className="text-5xl">🌱</span>
                            </div>
                          )}

                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h2 className="font-semibold text-gray-900 group-hover:text-sage-700 transition-colors leading-tight">
                                {diary.title}
                              </h2>
                              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(diary.status)}`}>
                                {statusLabel(diary.status)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{plantName}</p>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                              <span>{diary._count.entries} händelser</span>
                              {diary._count.reminders > 0 && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Bell className="h-3 w-3" />
                                  {diary._count.reminders} påminnelse{diary._count.reminders !== 1 ? "r" : ""}
                                </span>
                              )}
                              {lastEntry && (
                                <span>Senast: {formatDate(lastEntry.date)}</span>
                              )}
                            </div>

                            {/* Datummarkers */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {diary.sowingDate && (
                                <span className="text-xs px-2 py-0.5 bg-lime-50 text-lime-700 border border-lime-200 rounded-lg">
                                  🌱 {formatDate(diary.sowingDate)}
                                </span>
                              )}
                              {diary.plantingDate && (
                                <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                                  🪴 {formatDate(diary.plantingDate)}
                                </span>
                              )}
                              {diary.harvestDate && (
                                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                                  🌾 {formatDate(diary.harvestDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar: Kommande påminnelser */}
            <aside className="lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-5">
                <Card padding="md">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-4 w-4 text-amber-600" />
                    <h2 className="text-sm font-semibold text-gray-900">Kommande påminnelser</h2>
                  </div>
                  {upcomingReminders.length === 0 ? (
                    <p className="text-sm text-gray-400">Inga påminnelser de närmaste 14 dagarna.</p>
                  ) : (
                    <ul className="space-y-3">
                      {upcomingReminders.map((r) => {
                        const daysLeft = Math.ceil((r.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <li key={r.id} className="flex items-start gap-3">
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                              daysLeft <= 1 ? "bg-red-100 text-red-700" :
                              daysLeft <= 3 ? "bg-amber-100 text-amber-700" :
                                             "bg-gray-100 text-gray-600"
                            }`}>
                              {daysLeft === 0 ? "Idag" : daysLeft === 1 ? "Imorgon" : `${daysLeft}d`}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 leading-tight">{r.title}</p>
                              {r.diary && (
                                <Link href={`/dagbok/${r.diary.id}`} className="text-xs text-gray-400 hover:text-sage-600 transition-colors truncate block">
                                  {r.diary.title}
                                </Link>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>

                <Card padding="md" className="bg-sage-50 border-sage-100">
                  <h3 className="text-sm font-semibold text-sage-800 mb-2">Tips</h3>
                  <p className="text-xs text-sage-700 leading-relaxed">
                    Lägg till händelser regelbundet för att se din växts hela livscykel. Bilder gör tidslinjen ännu mer givande!
                  </p>
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
