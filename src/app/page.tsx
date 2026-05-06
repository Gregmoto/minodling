export const revalidate = 300;
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sprout, Users, MessageSquare, Leaf, BookOpen, ArrowRight,
  TrendingUp, Heart, Calendar, Flower2, Library, Image as ImageIcon,
  ChevronRight, Mail,
} from "lucide-react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignupForm } from "@/app/nyhetsbrev/NewsletterSignupForm";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Minodling – Sveriges odlingscommunity",
  description:
    "Sveriges odlingscommunity. Dela odlingstips, ställ frågor och hitta inspiration. Alltid gratis.",
  openGraph: {
    title: "Minodling – Sveriges odlingscommunity",
    description: "Gå med i Sveriges mest engagerade odlingscommunity.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

const MONTHS_SV = [
  "januari","februari","mars","april","maj","juni",
  "juli","augusti","september","oktober","november","december",
];

const QUICK_LINKS = [
  {
    href: "/vaxtdatabas",
    icon: Leaf,
    label: "Växtdatabas",
    desc: "Odlingsguider för 100+ växter",
    color: "bg-green-50 text-green-600",
  },
  {
    href: "/guider",
    icon: BookOpen,
    label: "Odlingsguider",
    desc: "Steg-för-steg från frö till skörd",
    color: "bg-amber-50 text-amber-600",
  },
  {
    href: "/kunskapsbank",
    icon: Library,
    label: "Kunskapsbank",
    desc: "Fördjupad odlingskunskap",
    color: "bg-purple-50 text-purple-600",
  },
  {
    href: "/fragor",
    icon: MessageSquare,
    label: "Frågor & Svar",
    desc: "Få hjälp av erfarna odlare",
    color: "bg-blue-50 text-blue-600",
  },
];

// ── Cached public data queries ─────────────────────────────────────────
const getPopularPosts = unstable_cache(
  async () => prisma.post.findMany({
    where: { status: "published" },
    orderBy: [{ likesCount: "desc" }, { commentsCount: "desc" }],
    take: 5,
    include: { author: { select: { username: true, fullName: true, avatarUrl: true } } },
  }).catch(() => []),
  ["home-popular-posts"],
  { revalidate: 60, tags: ["posts"] },
);

const getCalendarTips = unstable_cache(
  async (month: number) => prisma.gardenCalendar.findMany({
    where: { month, status: "published" },
    orderBy: { createdAt: "asc" },
    take: 6,
    select: { id: true, title: true, category: true, taskType: true, description: true, slug: true },
  }).catch(() => []),
  ["home-calendar-tips"],
  { revalidate: 3600, tags: ["calendar"] },
);

const getLatestGuide = unstable_cache(
  async () => prisma.guide.findFirst({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { title: true, slug: true, excerpt: true, imageUrl: true, category: true },
  }).catch(() => null),
  ["home-latest-guide"],
  { revalidate: 300, tags: ["guides"] },
);

const getMemberImages = unstable_cache(
  async () => prisma.post.findMany({
    where: { status: "published", imageUrl: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, title: true, imageUrl: true, author: { select: { username: true, avatarUrl: true } } },
  }).catch(() => []),
  ["home-member-images"],
  { revalidate: 120, tags: ["posts"] },
);

const getSiteCounts = unstable_cache(
  async () => Promise.all([
    prisma.plant.count().catch(() => 0),
    prisma.profile.count().catch(() => 0),
  ]),
  ["home-site-counts"],
  { revalidate: 300, tags: ["plants"] },
);

export default async function HomePage() {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const monthName = MONTHS_SV[currentMonth - 1];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Hämta all data parallellt – public queries är cachade
  const [navUser, popularPosts, calendarTips, latestGuide, memberImages, [plantCount, userCount]] = await Promise.all([
    getNavUser(user?.id),
    getPopularPosts(),
    getCalendarTips(currentMonth),
    getLatestGuide(),
    getMemberImages(),
    getSiteCounts(),
  ]);

  const TASK_COLORS: Record<string, string> = {
    sådd: "text-green-700 bg-green-50",
    plantering: "text-blue-700 bg-blue-50",
    skörd: "text-amber-700 bg-amber-50",
    skötsel: "text-purple-700 bg-purple-50",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-cream-50 to-amber-50 border-b border-sage-100">
          {/* Dekorativa cirklar */}
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-green-100/40 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-100/40 blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="container-main section-padding relative">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800 mb-6">
                <Sprout className="h-4 w-4" />
                Sveriges odlingscommunity
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight text-balance">
                Odla mer,{" "}
                <span className="text-green-600">dela mer,</span>{" "}
                skörda mer
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed text-balance max-w-2xl mx-auto">
                Gå med i Sveriges odlingscommunity. Dela tips, ställ frågor och hitta inspiration – alltid gratis.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      Min odling <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register">
                      <Button size="lg" className="w-full sm:w-auto">
                        Kom igång gratis <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/forum">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Utforska forumet
                      </Button>
                    </Link>
                  </>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── Snabblänkar ───────────────────────────────────────── */}
        <section className="py-10 bg-white border-b border-sage-100">
          <div className="container-main">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {QUICK_LINKS.map((ql) => {
                const Icon = ql.icon;
                return (
                  <Link key={ql.href} href={ql.href}>
                    <Card hover className="flex items-start gap-3 h-full">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${ql.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{ql.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">{ql.desc}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 ml-auto shrink-0 self-center" />
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Vad kan man odla nu + Odlingstips ─────────────────── */}
        <section className="section-padding bg-cream-50">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-8">

              {/* Vad man kan odla just nu */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Att göra i {monthName}</h2>
                    <p className="text-xs text-gray-500">Odlingskalendern för {monthName}</p>
                  </div>
                </div>

                {calendarTips.length === 0 ? (
                  <Card className="text-center py-10">
                    <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Inga tips för {monthName} ännu.</p>
                    <Link href="/guider" className="text-xs text-green-700 hover:underline mt-2 block">
                      Se guider istället →
                    </Link>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {calendarTips.map((tip) => {
                      const colorClass = TASK_COLORS[tip.taskType?.toLowerCase() ?? ""] ?? "text-gray-700 bg-gray-50";
                      return (
                        <div key={tip.id} className="bg-white rounded-xl border border-sage-100 px-4 py-3 flex items-start gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${colorClass}`}>
                            {tip.taskType ?? tip.category ?? "Tips"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                            {tip.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tip.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      href="/guider"
                      className="block text-center text-xs text-green-700 hover:text-green-800 pt-2 transition-colors"
                    >
                      Fler odlingstips i guiderna →
                    </Link>
                  </div>
                )}
              </div>

              {/* Dagens odlingstips / Senaste guide */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Flower2 className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Dagens odlingstips</h2>
                    <p className="text-xs text-gray-500">Senaste guiden från redaktionen</p>
                  </div>
                </div>

                {latestGuide ? (
                  <Link href={`/guider/${latestGuide.slug}`}>
                    <Card hover padding="none" className="overflow-hidden">
                      {latestGuide.imageUrl ? (
                        <img
                          src={latestGuide.imageUrl}
                          alt={latestGuide.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-amber-50 to-green-50 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-amber-200" />
                        </div>
                      )}
                      <div className="p-5">
                        {latestGuide.category && (
                          <Badge variant="outline" size="sm" className="mb-2">{latestGuide.category}</Badge>
                        )}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{latestGuide.title}</h3>
                        {latestGuide.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2">{latestGuide.excerpt}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-green-700 font-medium mt-3">
                          Läs guiden <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <Card className="text-center py-10">
                    <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-3">Inga guider publicerade ännu.</p>
                    <Link href="/guider">
                      <Button variant="outline" size="sm">Utforska guider</Button>
                    </Link>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Populära inlägg ───────────────────────────────────── */}
        <section className="section-padding bg-white">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Populärt</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-display">Heta diskussioner</h2>
              </div>
              <Link
                href="/forum"
                className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-800 transition-colors"
              >
                Se alla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {popularPosts.length === 0 ? (
              <Card className="text-center py-12">
                <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-3">Inga inlägg ännu – bli den första!</p>
                <Link href="/auth/register">
                  <Button size="sm">Skapa konto</Button>
                </Link>
              </Card>
            ) : (
              <div className="divide-y divide-sage-100 rounded-2xl border border-sage-100 overflow-hidden">
                {popularPosts.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/forum/${post.id}`}
                    className="flex items-start gap-4 p-4 sm:p-5 hover:bg-sage-50 transition-colors group bg-white"
                  >
                    {/* Rank */}
                    <span className="text-2xl font-bold text-gray-100 font-display w-7 shrink-0 leading-none mt-0.5">
                      {i + 1}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {post.category && (
                          <Badge variant="success" size="sm">{post.category}</Badge>
                        )}
                        {post.isFeatured && (
                          <Badge variant="warning" size="sm">⭐ Utvalt</Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Avatar src={post.author.avatarUrl} fallback={post.author.username} size="xs" />
                          <span>@{post.author.username}</span>
                        </div>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {post.commentsCount}
                        </span>
                        <span>·</span>
                        <span>{formatRelativeDate(post.createdAt)}</span>
                      </div>
                    </div>

                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-14 w-14 rounded-xl object-cover shrink-0 hidden sm:block"
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-4 text-center sm:hidden">
              <Link href="/forum" className="text-sm text-green-700 font-medium hover:underline">
                Se alla diskussioner →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Bildflöde från members ─────────────────────────────── */}
        {memberImages.length > 0 && (
          <section className="section-padding bg-cream-50">
            <div className="container-main">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Bildflöde</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">Från trädgårdarna</h2>
                </div>
                <Link
                  href="/forum"
                  className="hidden sm:flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-800 transition-colors"
                >
                  Se forum <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {memberImages.map((post) => (
                  <Link key={post.id} href={`/forum/${post.id}`} className="group relative">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-sage-100">
                      <img
                        src={post.imageUrl!}
                        alt={`${post.title} – foto av @${post.author.username}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div>
                        <p className="text-white text-xs font-medium line-clamp-1">{post.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Avatar src={post.author.avatarUrl} fallback={post.author.username} size="xs" />
                          <span className="text-white/80 text-xs">@{post.author.username}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Community-sektioner ───────────────────────────────── */}
        <section className="section-padding bg-white">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display mb-2">
                Utforska Minodling
              </h2>
              <p className="text-gray-500">Allt du behöver för din odling – på ett ställe</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  href: "/vaxtdatabas",
                  emoji: "🌱",
                  title: "Växtdatabas",
                  desc: "Odlingsguider och tips för hundratals växter. Såningstider, skötsel och vanliga problem.",
                  cta: "Utforska växtdatabasen",
                  bg: "from-green-50 to-emerald-50 border-green-100",
                  btn: "bg-green-600 hover:bg-green-700 text-white",
                },
                {
                  href: "/guider",
                  emoji: "📖",
                  title: "Odlingsguider",
                  desc: "Steg-för-steg-guider från erfarna odlare. Lär dig odla allt från tomater till jordgubbar.",
                  cta: "Läs guider",
                  bg: "from-amber-50 to-yellow-50 border-amber-100",
                  btn: "bg-amber-600 hover:bg-amber-700 text-white",
                },
                {
                  href: "/forum",
                  emoji: "💬",
                  title: "Community",
                  desc: "Ställ frågor, dela skördar och hitta odlingsvänner. Välkommen in i gemenskapen.",
                  cta: "Gå till forumet",
                  bg: "from-blue-50 to-sky-50 border-blue-100",
                  btn: "bg-blue-600 hover:bg-blue-700 text-white",
                },
              ].map((s) => (
                <div key={s.href} className={`rounded-2xl border bg-gradient-to-br ${s.bg} p-6 flex flex-col`}>
                  <div className="text-4xl mb-4">{s.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">{s.desc}</p>
                  <Link href={s.href}>
                    <button className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-colors ${s.btn}`}>
                      {s.cta} →
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nyhetsbrev ────────────────────────────────────────── */}
        <section className="section-padding bg-green-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-green-500/20 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="container-main relative">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium text-green-100 mb-5">
                <Mail className="h-4 w-4" />
                Gratis nyhetsbrev
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Odlingstips direkt i din inkorg
              </h2>
              <p className="text-green-100 mb-8 text-lg">
                Säsongsanpassade tips, nyheter från butiken och inspiration från communityn – varje vecka.
              </p>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 max-w-lg mx-auto">
                <NewsletterSignupForm source="homepage" />
                <p className="text-xs text-green-200 mt-3">Inga spam. Avprenumerera när du vill.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA – Gå med ──────────────────────────────────────── */}
        {!user && (
          <section className="section-padding bg-green-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
            <div className="container-main text-center relative">
              <div className="mx-auto max-w-xl">
                <div className="inline-flex items-center gap-2 text-green-200 text-sm font-medium mb-4">
                  <Users className="h-4 w-4" />
                  Gå med gratis – alltid
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                  Klar att börja din odlingsresa?
                </h2>
                <p className="text-green-100 mb-8 leading-relaxed">
                  Skapa ett gratis konto på 30 sekunder och börja dela din odlingspassion med communityn.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-green-700 hover:bg-green-50">
                      Skapa gratis konto <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto text-white hover:bg-green-700">
                      Logga in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
