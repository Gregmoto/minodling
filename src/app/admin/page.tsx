export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Users, FileText, MessageSquare, Leaf, BookOpen, Megaphone, HelpCircle, UserPlus, Flag, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin – Dashboard | Minodling" };

async function safeCount(fn: () => Promise<number>): Promise<number> {
  try { return await fn(); } catch { return 0; }
}

export default async function AdminDashboardPage() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, totalPosts, totalQuestions, totalComments,
    totalPlants, totalGuides, activeBanners,
    newUsersWeek, newPostsWeek, pendingReports,
  ] = await Promise.all([
    safeCount(() => prisma.profile.count()),
    safeCount(() => prisma.post.count({ where: { status: "published" } })),
    safeCount(() => prisma.question.count()),
    safeCount(() => prisma.postComment.count({ where: { status: "published" } })),
    safeCount(() => prisma.plant.count()),
    safeCount(() => prisma.guide.count({ where: { published: true } })),
    safeCount(() => prisma.banner.count({ where: { isActive: true } })),
    safeCount(() => prisma.profile.count({ where: { createdAt: { gte: oneWeekAgo } } })),
    safeCount(() => prisma.post.count({ where: { createdAt: { gte: oneWeekAgo } } })),
    safeCount(() => prisma.report.count({ where: { status: "pending" } })),
  ]);

  const [recentUsers, recentReports] = await Promise.all([
    prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, username: true, fullName: true, createdAt: true, role: true },
    }).catch(() => []),
    prisma.report.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { reporter: { select: { username: true } } },
    }).catch(() => []),
  ]);

  const stats = [
    { label: "Användare",     value: totalUsers,     sub: `+${newUsersWeek} denna vecka`, icon: Users,        color: "text-blue-600 bg-blue-50",   href: "/admin/anvandare" },
    { label: "Inlägg",        value: totalPosts,     sub: `+${newPostsWeek} denna vecka`, icon: FileText,     color: "text-green-600 bg-green-50",  href: "/admin/inlagg" },
    { label: "Frågor",        value: totalQuestions, sub: null,                           icon: HelpCircle,   color: "text-indigo-600 bg-indigo-50", href: "/admin/fragor" },
    { label: "Kommentarer",   value: totalComments,  sub: null,                           icon: MessageSquare,color: "text-purple-600 bg-purple-50", href: "/admin/kommentarer" },
    { label: "Växter",        value: totalPlants,    sub: null,                           icon: Leaf,         color: "text-emerald-600 bg-emerald-50",href: "/admin/vaxter" },
    { label: "Guider",        value: totalGuides,    sub: "publicerade",                  icon: BookOpen,     color: "text-amber-600 bg-amber-50",  href: "/admin/guider" },
    { label: "Aktiva banners",value: activeBanners,  sub: null,                           icon: Megaphone,    color: "text-pink-600 bg-pink-50",    href: "/admin/annonser" },
    { label: "Rapporter",     value: pendingReports, sub: "väntar",                       icon: Flag,         color: "text-red-600 bg-red-50",      href: "/admin/rapporter" },
  ];

  const roleColors: Record<string, "danger" | "warning" | "default"> = {
    admin: "danger", moderator: "warning", user: "default",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Välkommen till Minodlings adminpanel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card padding="md" hover className="h-full">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.color} mb-3`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                {s.sub && <div className="text-[11px] text-green-600 mt-1 font-medium">{s.sub}</div>}
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Senaste användare */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Senaste registreringar</h2>
            </div>
            <Link href="/admin/anvandare" className="text-xs text-green-700 hover:underline flex items-center gap-1">
              Se alla <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Inga användare ännu</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{u.fullName ?? u.username}</div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleColors[u.role] ?? "default"} size="sm">{u.role}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Senaste rapporter */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-500" />
              <h2 className="font-semibold text-gray-900 text-sm">
                Väntande rapporter
                {pendingReports > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {pendingReports}
                  </span>
                )}
              </h2>
            </div>
            <Link href="/admin/rapporter" className="text-xs text-green-700 hover:underline flex items-center gap-1">
              Se alla <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Inga väntande rapporter 🎉</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentReports.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{r.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.targetType} · @{r.reporter.username} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <Badge variant="danger" size="sm">Väntar</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
