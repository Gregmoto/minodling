export const revalidate = 60;
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import {
  MapPin, Sprout, Star, MessageSquare, Heart, BookOpen,
  Pencil, Image as ImageIcon, Bookmark, Users, Calendar,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: { fullName: true, bio: true, avatarUrl: true },
  });
  if (!profile) return { title: "Användare hittades inte" };

  const name = profile.fullName ?? username;
  return {
    title: `${name} (@${username}) – Minodling`,
    description: profile.bio ?? `${name} är odlare på Minodling.`,
    openGraph: {
      title: `${name} (@${username})`,
      description: profile.bio ?? `Odlarprofil på Minodling`,
      ...(profile.avatarUrl && {
        images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: name }],
      }),
    },
  };
}

const GROWING_TYPE_LABELS: Record<string, string> = {
  balcony: "🪴 Balkong",
  greenhouse: "🏡 Växthus",
  garden: "🌳 Trädgård",
  indoor: "🪟 Inomhus",
  allotment: "🌱 Kolonilott",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "🌱 Nybörjare",
  hobbyist: "🌿 Hobbyodlare",
  experienced: "🌳 Erfaren",
};

type TabType = "inlagg" | "bilder" | "dagbok" | "sparade";

export default async function ProfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ flik?: string }>;
}) {
  const [{ username }, sp] = await Promise.all([params, searchParams]);
  const activeTab = (sp.flik ?? "inlagg") as TabType;

  const authUser = await getCurrentUser();

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
          gardenDiaries: true,
          savedPosts: true,
        },
      },
    },
  });

  if (!profile) notFound();

  const isOwner = authUser?.id === profile.userId;

  // Hämta tab-data
  const [posts, imagePosts, diaries, savedPosts] = await Promise.all([
    activeTab === "inlagg"
      ? prisma.post.findMany({
          where: { userId: profile.id, status: "published" },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, title: true, content: true, imageUrl: true, category: true, likesCount: true, commentsCount: true, createdAt: true },
        }).catch(() => [])
      : Promise.resolve([]),

    activeTab === "bilder"
      ? prisma.post.findMany({
          where: { userId: profile.id, status: "published", imageUrl: { not: null } },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { id: true, title: true, imageUrl: true },
        }).catch(() => [])
      : Promise.resolve([]),

    activeTab === "dagbok"
      ? prisma.gardenDiary.findMany({
          where: { userId: profile.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { plant: { select: { name: true, slug: true } } },
        }).catch(() => [])
      : Promise.resolve([]),

    activeTab === "sparade" && isOwner
      ? prisma.savedPost.findMany({
          where: { userId: profile.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            post: {
              select: { id: true, title: true, category: true, likesCount: true, commentsCount: true, createdAt: true },
            },
          },
        }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const navUser = authUser
    ? await prisma.profile.findUnique({
        where: { userId: authUser.id },
        select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
      }).then((p) =>
        p ? { id: p.id, username: p.username, displayName: p.fullName, avatarUrl: p.avatarUrl, role: p.role } : null
      ).catch(() => null)
    : null;

  const tabs = [
    { id: "inlagg",  label: "Inlägg",    icon: MessageSquare, count: profile._count.posts },
    { id: "bilder",  label: "Bilder",    icon: ImageIcon },
    { id: "dagbok",  label: "Dagbok",    icon: Calendar, count: profile._count.gardenDiaries },
    ...(isOwner ? [{ id: "sparade", label: "Sparade", icon: Bookmark, count: profile._count.savedPosts }] : []),
  ] as { id: TabType; label: string; icon: React.ElementType; count?: number }[];

  const displayName = profile.fullName ?? profile.username;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">

        {/* ── Profilhuvud ─────────────────────────────────────── */}
        <div className="bg-white border-b border-sage-100">
          {/* Banner */}
          <div className="h-28 sm:h-36 bg-gradient-to-br from-green-100 via-sage-50 to-amber-50" />

          <div className="container-main">
            <div className="relative -mt-12 pb-6 flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar
                  src={profile.avatarUrl}
                  fallback={displayName}
                  size="xl"
                  className="h-24 w-24 ring-4 ring-white shadow-md"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap mt-2">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                  </div>
                  {isOwner && (
                    <Link
                      href={`/profil/${username}/redigera`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Redigera
                    </Link>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-sm text-gray-600 mt-2 max-w-lg">{profile.bio}</p>
                )}

                {/* Meta-info */}
                <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-gray-500">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {profile.location}
                    </span>
                  )}
                  {profile.growingType && (
                    <span>{GROWING_TYPE_LABELS[profile.growingType] ?? profile.growingType}</span>
                  )}
                  {profile.growingZone && (
                    <span className="flex items-center gap-1">
                      <Sprout className="h-3.5 w-3.5" /> Zon {profile.growingZone}
                    </span>
                  )}
                  {profile.experienceLevel && (
                    <span>{EXPERIENCE_LABELS[profile.experienceLevel] ?? profile.experienceLevel}</span>
                  )}
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Star className="h-3.5 w-3.5" /> {profile.points} poäng
                  </span>
                </div>

                {/* Följare */}
                <div className="flex items-center gap-5 mt-3 text-sm">
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{profile._count.following}</strong> följer
                  </span>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{profile._count.followers}</strong> följare
                  </span>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{profile._count.posts}</strong> inlägg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-main py-6">
          <Breadcrumbs
            items={[{ name: `@${username}`, href: `/profil/${username}` }]}
            className="mb-5"
          />

          {/* ── Flikar ───────────────────────────────────────── */}
          <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/profil/${username}${tab.id !== "inlagg" ? `?flik=${tab.id}` : ""}`}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    active
                      ? "border-green-600 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1 text-xs ${active ? "text-green-600" : "text-gray-400"}`}>
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Inlägg ───────────────────────────────────────── */}
          {activeTab === "inlagg" && (
            <div className="space-y-3">
              {posts.length === 0 ? (
                <Card className="text-center py-12">
                  <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Inga inlägg ännu.</p>
                  {isOwner && (
                    <Link href="/forum" className="text-xs text-green-700 hover:underline mt-2 block">
                      Skriv ditt första inlägg →
                    </Link>
                  )}
                </Card>
              ) : posts.map((post) => (
                <Link key={post.id} href={`/forum/${post.id}`}>
                  <Card hover className="flex items-start gap-3">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-16 w-16 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {post.category && <Badge variant="outline" size="sm" className="mb-1">{post.category}</Badge>}
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likesCount}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.commentsCount}</span>
                        <span>{formatRelativeDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* ── Bilder ───────────────────────────────────────── */}
          {activeTab === "bilder" && (
            imagePosts.length === 0 ? (
              <Card className="text-center py-12">
                <ImageIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Inga bilder delade ännu.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imagePosts.map((post) => (
                  <Link key={post.id} href={`/forum/${post.id}`} className="group relative aspect-square">
                    <div className="w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src={post.imageUrl!}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs font-medium line-clamp-2">{post.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {/* ── Odlingsdagbok ─────────────────────────────────── */}
          {activeTab === "dagbok" && (
            <div className="space-y-3">
              {diaries.length === 0 ? (
                <Card className="text-center py-12">
                  <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Ingen odlingsdagbok ännu.</p>
                  {isOwner && (
                    <Link href="/min-odling" className="text-xs text-green-700 hover:underline mt-2 block">
                      Starta din dagbok →
                    </Link>
                  )}
                </Card>
              ) : diaries.map((diary) => (
                <Card key={diary.id} className="flex items-start gap-4">
                  {diary.imageUrl ? (
                    <img src={diary.imageUrl} alt={diary.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <Sprout className="h-6 w-6 text-green-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{diary.title}</h3>
                      <Badge
                        variant={diary.status === "harvested" ? "success" : diary.status === "growing" ? "warning" : "default"}
                        size="sm"
                      >
                        {diary.status === "growing" ? "Växer" : diary.status === "harvested" ? "Skördad" : diary.status}
                      </Badge>
                    </div>
                    {diary.plant && (
                      <Link href={`/vaxtdatabas/${diary.plant.slug}`} className="text-xs text-green-700 hover:underline">
                        {diary.plant.name}
                      </Link>
                    )}
                    {diary.customPlantName && !diary.plant && (
                      <p className="text-xs text-gray-500">{diary.customPlantName}</p>
                    )}
                    {diary.notes && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{diary.notes}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(diary.createdAt)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── Sparade inlägg ────────────────────────────────── */}
          {activeTab === "sparade" && isOwner && (
            <div className="space-y-3">
              {savedPosts.length === 0 ? (
                <Card className="text-center py-12">
                  <Bookmark className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Inga sparade inlägg.</p>
                </Card>
              ) : savedPosts.map((saved) => (
                <Link key={saved.id} href={`/forum/${saved.post.id}`}>
                  <Card hover>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {saved.post.category && <Badge variant="outline" size="sm" className="mb-1">{saved.post.category}</Badge>}
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{saved.post.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{saved.post.likesCount}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{saved.post.commentsCount}</span>
                          <span>{formatRelativeDate(saved.post.createdAt)}</span>
                        </div>
                      </div>
                      <Bookmark className="h-4 w-4 text-sage-400 shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "sparade" && !isOwner && (
            <Card className="text-center py-12">
              <p className="text-gray-400 text-sm">Sparade inlägg är privata.</p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
