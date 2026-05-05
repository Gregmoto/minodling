export const revalidate = 60;
import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Plus, TrendingUp, Clock, Flame, Filter, MessageSquare, Heart } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { formatRelativeDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Forum",
    description: "Diskutera odling med tusentals svenska odlare i Minodlings forum.",
    alternates: { canonical: `${s.seoCanonical.replace(/\/$/, "")}/forum` },
  };
}

interface ForumPageProps {
  searchParams: Promise<{ sort?: string; kategori?: string; sida?: string }>;
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const params       = await searchParams;
  const sort         = params.sort ?? "new";
  const kategori     = params.kategori;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [categoryGroups, posts, profile] = await Promise.all([
    prisma.post.groupBy({
      by: ["category"],
      where: { category: { not: null }, status: { in: ["published", "pinned"] } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.post.findMany({
      where: {
        status: { in: ["published", "pinned"] },
        ...(kategori ? { category: kategori } : {}),
      },
      orderBy:
        sort === "top" ? { likesCount: "desc" }
        : sort === "hot" ? { commentsCount: "desc" }
        : { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { username: true, fullName: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
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

  const sortOptions = [
    { label: "Nyast",      value: "new", icon: Clock },
    { label: "Populärast", value: "top", icon: TrendingUp },
    { label: "Hett",       value: "hot", icon: Flame },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Huvudflöde */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Forum</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {posts.length} inlägg{kategori ? " i denna kategori" : ""}
                  </p>
                </div>
                {user && (
                  <Link href="/forum/nytt-inlagg">
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      Nytt inlägg
                    </Button>
                  </Link>
                )}
              </div>

              {/* Sortering */}
              <div className="flex items-center gap-2 mb-5">
                {sortOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <Link
                      key={opt.value}
                      href={`/forum?sort=${opt.value}${kategori ? `&kategori=${kategori}` : ""}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sort === opt.value
                          ? "bg-green-600 text-white"
                          : "bg-white border border-sage-200 text-gray-600 hover:border-green-400"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </Link>
                  );
                })}
              </div>

              {/* Inläggslista */}
              {posts.length === 0 ? (
                <Card className="text-center py-16">
                  <p className="text-gray-400 mb-4">Inga inlägg hittades</p>
                  {user && (
                    <Link href="/forum/nytt-inlagg">
                      <Button variant="outline" size="sm">Skapa det första</Button>
                    </Link>
                  )}
                </Card>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <Card key={post.id} hover padding="md">
                      <Link href={`/forum/${post.id}`} className="block">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={post.author.avatarUrl}
                            fallback={post.author.fullName ?? post.author.username}
                            size="sm"
                            className="shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {post.status === "pinned" && (
                                <Badge variant="warning" size="sm">Fastnålad</Badge>
                              )}
                              {post.category && (
                                <Badge variant="success" size="sm">{post.category}</Badge>
                              )}
                            </div>

                            <h2 className="font-semibold text-gray-900 hover:text-green-700 transition-colors line-clamp-2 mb-2">
                              {post.title}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              <span className="font-medium text-gray-600">
                                {post.author.fullName ?? post.author.username}
                              </span>
                              <span>·</span>
                              <span>{formatRelativeDate(post.createdAt)}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" /> {post.likesCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> {post._count.comments}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 space-y-5 shrink-0">
              <Card padding="none">
                <div className="px-5 py-4 border-b border-sage-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <Filter className="h-4 w-4 text-green-600" />
                    Kategorier
                  </h2>
                </div>
                <div className="p-2">
                  <Link
                    href="/forum"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      !kategori ? "bg-green-50 text-green-700 font-medium" : "text-gray-700 hover:bg-sage-50"
                    }`}
                  >
                    <span>Alla kategorier</span>
                  </Link>
                  {categoryGroups.map((group) => (
                    <Link
                      key={group.category}
                      href={`/forum?kategori=${encodeURIComponent(group.category ?? "")}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        kategori === group.category
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-700 hover:bg-sage-50"
                      }`}
                    >
                      <span>{group.category}</span>
                      <span className="text-xs text-gray-400">{group._count.id}</span>
                    </Link>
                  ))}
                </div>
              </Card>

              {!user && (
                <Card className="text-center bg-green-50 border-green-100">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Gå med i diskussionen!
                  </h3>
                  <p className="text-sm text-green-700 mb-4">
                    Skapa ett gratis konto och dela din odlingspassion.
                  </p>
                  <Link href="/auth/register" className="block">
                    <Button size="sm" className="w-full">Skapa konto</Button>
                  </Link>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
