export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Users, FileText, MessageSquare, TrendingUp, UserPlus, Eye } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Admin – Översikt | Minodling" };

export default async function AdminOverviewPage() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalPosts, totalComments, newUsersThisWeek, newPostsThisWeek, recentUsers, recentPosts] =
    await Promise.all([
      prisma.profile.count(),
      prisma.post.count({ where: { status: "published" } }),
      prisma.postComment.count({ where: { status: "published" } }),
      prisma.profile.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.post.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { username: true, fullName: true, createdAt: true, role: true },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { author: { select: { username: true } } },
      }),
    ]);

  const stats = [
    { label: "Totalt användare",   value: totalUsers,    change: `+${newUsersThisWeek} denna vecka`, icon: Users,        color: "text-blue-600 bg-blue-50" },
    { label: "Publicerade inlägg", value: totalPosts,    change: `+${newPostsThisWeek} denna vecka`, icon: FileText,     color: "text-green-600 bg-green-50" },
    { label: "Kommentarer",        value: totalComments, change: undefined,                           icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
    { label: "Veckotillväxt",      value: `${((newUsersThisWeek / Math.max(totalUsers, 1)) * 100).toFixed(1)}%`, change: undefined, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Översikt</h1>
        <p className="text-gray-500 text-sm mt-1">Välkommen till Minodlings adminpanel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              {stat.change && <div className="text-xs text-green-600 mt-1 font-medium">{stat.change}</div>}
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card padding="none">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-sage-100">
            <UserPlus className="h-4 w-4 text-green-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Senaste registreringar</h2>
          </div>
          <div className="divide-y divide-sage-100">
            {recentUsers.map((u) => (
              <div key={u.username} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{u.fullName ?? u.username}</div>
                  <div className="text-xs text-gray-400">@{u.username}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Intl.DateTimeFormat("sv-SE", { dateStyle: "short" }).format(u.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="none">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-sage-100">
            <Eye className="h-4 w-4 text-green-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Senaste inlägg</h2>
          </div>
          <div className="divide-y divide-sage-100">
            {recentPosts.map((post) => (
              <div key={post.id} className="px-5 py-3">
                <div className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>@{post.author.username}</span>
                  {post.category && <><span>·</span><span>{post.category}</span></>}
                  <span>·</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.likesCount}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
