import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sprout,
  MessageSquare,
  Heart,
  Star,
  TrendingUp,
  Bell,
  Plus,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Min dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      _count: { select: { posts: true, comments: true } },
      notifications: {
        where: { isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { category: true },
      },
    },
  });

  if (!profile) redirect("/auth/login");

  const stats = [
    { label: "Inlägg", value: profile._count.posts, icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { label: "Kommentarer", value: profile._count.comments, icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
    { label: "Poäng", value: profile.points, icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: "Oglästa notiser", value: profile.notifications.length, icon: Bell, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Välkomsthälsning */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.displayName ?? profile.username}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hej, {profile.displayName ?? profile.username}! 👋
            </h1>
            <p className="text-gray-500 text-sm">
              {profile.membershipTier === "PREMIUM" ? (
                <Badge variant="premium" size="sm">Premium-medlem</Badge>
              ) : (
                <span>Gratismedlem · <Link href="/premium" className="text-green-700 hover:underline">Uppgradera</Link></span>
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

      {/* Statistik-kort */}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Senaste inlägg */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100">
              <CardTitle className="text-base">Mina senaste inlägg</CardTitle>
              <Link href="/profil" className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 transition-colors">
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
                    href={`/forum/${post.slug}`}
                    className="flex items-start gap-3 p-5 hover:bg-sage-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      {post.category && (
                        <Badge variant="success" size="sm" className="mb-1.5">
                          {post.category.name}
                        </Badge>
                      )}
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {post.commentCount}
                        </span>
                        <span>{formatRelativeDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Notifikationer */}
        <div>
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100">
              <CardTitle className="text-base">Notifikationer</CardTitle>
              {profile.notifications.length > 0 && (
                <Badge variant="success" size="sm">{profile.notifications.length} nya</Badge>
              )}
            </div>

            {profile.notifications.length === 0 ? (
              <div className="text-center py-10 px-6">
                <Bell className="h-8 w-8 text-sage-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Inga nya notifikationer</p>
              </div>
            ) : (
              <div className="divide-y divide-sage-100">
                {profile.notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-sage-50 transition-colors">
                    <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatRelativeDate(notif.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Snabblänkar */}
          <Card className="mt-4" padding="md">
            <CardTitle className="text-sm mb-3">Snabblänkar</CardTitle>
            <div className="space-y-2">
              {[
                { label: "Min odling", href: "/min-odling", icon: "🌱" },
                { label: "Mina sparade inlägg", href: "/sparade", icon: "🔖" },
                { label: "Inställningar", href: "/installningar", icon: "⚙️" },
                { label: "Premium", href: "/premium", icon: "⭐" },
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
        </div>
      </div>
    </div>
  );
}
