export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, BookOpen, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WeeklyTaskWidget } from "@/components/odlingsvecka/WeeklyTaskWidget";
import { getOrGenerateWeeklyTasks, getISOWeek } from "@/lib/weeklyTasks";
import { TASK_SOURCES } from "./constants";

export const metadata: Metadata = {
  title: "Din odlingsvecka",
  description: "Dina personliga odlingsuppgifter för veckan, baserade på dina växter, dagbok och säsong.",
};

const SWEDISH_MONTHS = ["", "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december"];

export default async function OdlingsveckaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true, growingType: true },
  });
  if (!profile) redirect("/auth/login");

  const navUser = {
    id: profile.id, username: profile.username,
    displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role,
  };

  const tasks = await getOrGenerateWeeklyTasks(profile.id);
  const { weekNumber, weekYear } = getISOWeek(new Date());

  const now   = new Date();
  const month = now.getMonth() + 1;

  // Statistik för sidopanel
  const [diaryCount, reminderCount] = await Promise.all([
    prisma.gardenDiary.count({ where: { userId: profile.id, status: "growing" } }),
    prisma.reminder.count({ where: { userId: profile.id, isCompleted: false } }),
  ]);

  const done     = tasks.filter((t) => t.done).length;
  const undone   = tasks.filter((t) => !t.done);
  const doneList = tasks.filter((t) =>  t.done);

  const sourceBreakdown = Object.entries(TASK_SOURCES).map(([key, val]) => ({
    key, ...val, count: tasks.filter((t) => t.source === key).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">

        {/* Hero */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-b border-gray-100 py-10">
          <div className="container-main">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Din odlingsvecka</h1>
                <p className="text-sm text-gray-500">Vecka {weekNumber}, {weekYear} · {SWEDISH_MONTHS[month]}</p>
              </div>
            </div>
            <p className="text-gray-500 max-w-xl mt-2">
              Personliga uppgifter baserade på dina växter, odlingsdagbok och vad som är rätt tid på säsongen.
            </p>
          </div>
        </div>

        <div className="container-main py-8">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Uppgifter */}
            <div className="lg:col-span-2 space-y-6">

              {/* Att göra */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <h2 className="font-semibold text-gray-900">
                    Att göra {undone.length > 0 && (
                      <span className="ml-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {undone.length}
                      </span>
                    )}
                  </h2>
                </div>
                <WeeklyTaskWidget tasks={tasks} weekNumber={weekNumber} expanded={true} />
              </div>

            </div>

            {/* Sidebar */}
            <aside className="space-y-5">

              {/* Veckosummering */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Veckans status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Klara uppgifter</span>
                    <span className="font-semibold text-green-600">{done} / {tasks.length}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: tasks.length > 0 ? `${Math.round((done / tasks.length) * 100)}%` : "0%" }}
                    />
                  </div>
                  {done === tasks.length && tasks.length > 0 && (
                    <p className="text-xs text-green-600 font-medium text-center pt-1">
                      🎉 Veckans alla uppgifter klara!
                    </p>
                  )}
                </div>

                {sourceBreakdown.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 mb-2">Uppgifter kommer från</p>
                    {sourceBreakdown.map((s) => (
                      <div key={s.key} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          {s.icon} {s.label}
                        </span>
                        <span className="font-medium text-gray-700">{s.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Din odling */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Din odling</h3>
                <div className="space-y-3">
                  <Link href="/dagbok"
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-green-700">Odlingsdagbok</p>
                        <p className="text-xs text-gray-400">{diaryCount} aktiva växter</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-green-400">→</span>
                  </Link>
                  <Link href="/paminnelser"
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-amber-50 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700">Påminnelser</p>
                        <p className="text-xs text-gray-400">{reminderCount} aktiva</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-amber-400">→</span>
                  </Link>
                  <Link href="/kalender"
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">Odlingskalender</p>
                        <p className="text-xs text-gray-400">{SWEDISH_MONTHS[month]}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-blue-400">→</span>
                  </Link>
                </div>
              </div>

              {/* Klara uppgifter */}
              {doneList.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Klart denna vecka ✓</h3>
                  <ul className="space-y-1.5">
                    {doneList.map((t) => (
                      <li key={t.id} className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{t.icon ?? "🌿"}</span>
                        <span className="line-through">{t.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
