import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Sprout, MessageSquare, Heart, Star, TrendingUp, Plus, ArrowRight, Bell, AlertTriangle, CalendarDays } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { CompleteButton } from "@/components/reminders/CompleteButton";
import { formatRelativeDate } from "@/lib/utils";
import { REMINDER_TYPES } from "@/app/paminnelser/constants";
import { WeeklyTaskWidget } from "@/components/odlingsvecka/WeeklyTaskWidget";
import { getOrGenerateWeeklyTasks, getISOWeek } from "@/lib/weeklyTasks";

// ── Asynkront vecko-block (laddas via Suspense) ───────────────────────
async function WeeklySection({ profileId }: { profileId: string }) {
  const { weekNumber } = getISOWeek(new Date());
  const weeklyTasks = await getOrGenerateWeeklyTasks(profileId);
  return (
    <Card padding="none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-green-600" />
          <span className="text-sm font-semibold text-gray-800">Din odlingsvecka</span>
          <span className="text-xs text-gray-400">v.{weekNumber}</span>
        </div>
        <Link href="/odlingsvecka" className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 transition-colors">
          Visa allt <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <WeeklyTaskWidget tasks={weeklyTasks.slice(0, 4)} weekNumber={weekNumber} />
    </Card>
  );
}

function WeeklySkeletonFallback() {
  return (
    <Card padding="none">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <CalendarDays className="h-4 w-4 text-green-600" />
        <span className="text-sm font-semibold text-gray-800">Din odlingsvecka</span>
      </div>
      <div className="p-4 space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </Card>
  );
}

export const metadata: Metadata = { title: "Min dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      id: true, userId: true, username: true, fullName: true,
      avatarUrl: true, role: true, points: true, experienceLevel: true,
      posts: {
        select: {
          id: true, title: true, category: true, createdAt: true,
          likesCount: true, commentsCount: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!profile) redirect("/auth/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcomingReminders, overdueReminders] = await Promise.all([
    prisma.reminder.findMany({
      where:   { userId: profile.id, isCompleted: false, dueDate: { gte: today, lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { diary: { select: { id: true, title: true } } },
    }),
    prisma.reminder.findMany({
      where:   { userId: profile.id, isCompleted: false, dueDate: { lt: today } },
      orderBy: { dueDate: "asc" },
      take: 3,
    }),
  ]);

  const stats = [
    { label: "Inlägg",      value: profile._count.posts,    icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { label: "Kommentarer", value: profile._count.comments,  icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
    { label: "Poäng",       value: profile.points,           icon: Star,          color: "text-amber-600 bg-amber-50" },
    { label: "Nivå",        value: profile.experienceLevel ?? "Nybörjare", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Välkomsthälsning */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.fullName ?? profile.username}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hej, {profile.fullName ?? profile.username}! 👋
            </h1>
            <p className="text-gray-500 text-sm">
              {profile.role === "admin" ? (
                <Badge variant="danger" size="sm">Admin</Badge>
              ) : profile.role === "moderator" ? (
                <Badge variant="warning" size="sm">Moderator</Badge>
              ) : (
                <Badge variant="success" size="sm">Medlem</Badge>
              )}
            </p>
          </div>
        </div>
        <Link href="/forum/nytt-inlagg">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nytt inlägg
          </Button>
        </Link>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Påminnelse-banner om förfallna finns */}
      {overdueReminders.length > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">
              {overdueReminders.length} förfallen{overdueReminders.length !== 1 ? "a" : ""} påminnelse{overdueReminders.length !== 1 ? "r" : ""}
            </p>
            <p className="text-xs text-red-600 truncate">{overdueReminders[0].title}{overdueReminders.length > 1 ? ` och ${overdueReminders.length - 1} till` : ""}</p>
          </div>
          <Link href="/paminnelser?tab=overdue" className="shrink-0 text-xs font-medium text-red-700 hover:underline">
            Hantera →
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Senaste inlägg + Odlingsvecka */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100">
              <CardTitle className="text-base">Mina senaste inlägg</CardTitle>
              <Link href={`/profil/${profile.username}`} className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 transition-colors">
                Se alla <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {profile.posts.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Sprout className="h-10 w-10 text-sage-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">Du har inte skrivit något än</p>
                <Link href="/forum/nytt-inlagg">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                    Skriv ditt första inlägg
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-sage-100">
                {profile.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/forum/${post.id}`}
                    className="flex items-start gap-3 p-5 hover:bg-sage-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      {post.category && (
                        <Badge variant="success" size="sm" className="mb-1.5">
                          {post.category}
                        </Badge>
                      )}
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {post.commentsCount}
                        </span>
                        <span>{formatRelativeDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Din odlingsvecka – laddas asynkront via Suspense */}
          <Suspense fallback={<WeeklySkeletonFallback />}>
            <WeeklySection profileId={profile.id} />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Påminnelser denna veckan */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base">Denna veckan</CardTitle>
              </div>
              <Link href="/paminnelser" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
                Alla <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {upcomingReminders.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-400">Inga påminnelser 🎉</p>
                <Link href="/paminnelser?tab=new" className="text-xs text-amber-600 hover:underline mt-1 block">
                  Lägg till
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcomingReminders.map((r) => {
                  const typeInfo = REMINDER_TYPES.find((t) => t.value === r.reminderType);
                  const days = Math.ceil((r.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                      <CompleteButton reminderId={r.id} isCompleted={false} />
                      <span className="text-base shrink-0">{typeInfo?.emoji ?? "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 leading-tight truncate">{r.title}</p>
                        {r.diary && (
                          <p className="text-xs text-gray-400 truncate">{r.diary.title}</p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${
                        days === 0 ? "text-orange-600" : days === 1 ? "text-amber-600" : "text-gray-400"
                      }`}>
                        {days === 0 ? "Idag" : days === 1 ? "Imorgon" : `${days}d`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Snabblänkar */}
          <Card padding="md">
            <CardTitle className="text-sm mb-3">Snabblänkar</CardTitle>
            <div className="space-y-2">
              {[
                { label: "Min odling",      href: "/min-odling",    icon: "🌱" },
                { label: "Odlingsdagbok",   href: "/dagbok",        icon: "📔" },
                { label: "Påminnelser",     href: "/paminnelser",   icon: "🔔" },
                { label: "Fröbyte",         href: "/frobyten",      icon: "🌾" },
                { label: "Mina grupper",    href: "/grupper",       icon: "👥" },
                { label: "Inställningar",   href: "/installningar", icon: "⚙️" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-sage-50 hover:text-green-700 transition-colors"
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>

          {profile.role === "admin" && (
            <Card className="mt-4 bg-green-50 border-green-100" padding="md">
              <CardTitle className="text-sm mb-3 text-green-800">Admin</CardTitle>
              <div className="space-y-2">
                {[
                  { label: "Översikt",    href: "/admin" },
                  { label: "Användare",   href: "/admin/anvandare" },
                  { label: "Inlägg",      href: "/admin/inlagg" },
                  { label: "Rapporter",   href: "/admin/rapporter" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-1.5 rounded-lg text-sm text-green-800 hover:bg-green-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}
