export const revalidate = 60;
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Users, ImageIcon, CalendarDays, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { formatDate } from "@/lib/utils";
import { EntryUploadForm } from "@/components/utmaningar/EntryUploadForm";
import { JoinChallengeButton } from "@/components/utmaningar/JoinChallengeButton";
import { EntryCard } from "@/components/utmaningar/EntryCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.challenge.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!c) return {};
  return {
    title: `${c.title} – Odlingsutmaning`,
    description: c.description ?? undefined,
  };
}

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  active:   "bg-green-100 text-green-700",
  ended:    "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  upcoming: "Kommande", active: "Pågående", ended: "Avslutad",
};

export default async function UtmaningDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  }) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const challenge = await prisma.challenge.findUnique({
    where: { slug, published: true },
    include: {
      _count: { select: { participants: true, entries: true } },
      participants: {
        take: 20,
        include: { profile: { select: { id: true, username: true, avatarUrl: true } } },
        orderBy: { joinedAt: "desc" },
      },
      entries: {
        orderBy: { createdAt: "desc" },
        include: {
          profile: { select: { id: true, username: true, avatarUrl: true } },
          comments: {
            orderBy: { createdAt: "asc" },
            include: { profile: { select: { id: true, username: true, avatarUrl: true } } },
          },
        },
      },
    },
  });

  if (!challenge) notFound();

  const isParticipant = navProfile
    ? challenge.participants.some((p) => p.userId === navProfile.id)
    : false;

  const canJoin = challenge.status === "active";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">

        {/* Hero */}
        <div className="relative h-64 bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
          {challenge.imageUrl ? (
            <Image src={challenge.imageUrl} alt={challenge.title} fill className="object-cover" sizes="100vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-30">🏆</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 container-main">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium mb-2 ${STATUS_STYLE[challenge.status] ?? STATUS_STYLE.upcoming}`}>
                  {STATUS_LABEL[challenge.status]}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">{challenge.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container-main py-8">
          <Breadcrumbs
            items={[
              { name: "Utmaningar", href: "/utmaningar" },
              { name: challenge.title, href: `/utmaningar/${slug}` },
            ]}
            className="mb-6"
          />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">

              {/* Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {challenge._count.participants} deltagare
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4" /> {challenge._count.entries} bidrag
                  </span>
                  {challenge.startDate && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(challenge.startDate)}
                      {challenge.endDate && <> – {formatDate(challenge.endDate)}</>}
                    </span>
                  )}
                  {challenge.category && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                      {challenge.category}
                    </span>
                  )}
                </div>

                {challenge.description && (
                  <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
                )}

                {challenge.rules && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-xs font-semibold text-amber-800 mb-1 uppercase tracking-wide">Regler</p>
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{challenge.rules}</p>
                  </div>
                )}

                {/* Join/leave + upload */}
                {navUser ? (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {canJoin && (
                      <JoinChallengeButton
                        challengeId={challenge.id}
                        isParticipant={isParticipant}
                      />
                    )}
                    {isParticipant && challenge.status === "active" && (
                      <EntryUploadForm challengeId={challenge.id} slug={slug} />
                    )}
                    {!canJoin && (
                      <p className="text-sm text-gray-400 italic">
                        {challenge.status === "upcoming" ? "Utmaningen har inte börjat ännu." : "Utmaningen är avslutad."}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    <Link href="/logga-in" className="text-amber-600 hover:underline font-medium">Logga in</Link> för att delta i utmaningen.
                  </p>
                )}
              </div>

              {/* Entries grid */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Bidrag ({challenge._count.entries})
                </h2>
                {challenge.entries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <Trophy className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Inga bidrag ännu. Bli den första!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {challenge.entries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        slug={slug}
                        currentProfileId={navProfile?.id ?? null}
                        isAdmin={navProfile?.role === "admin"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Participants */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  Deltagare ({challenge._count.participants})
                </h3>
                {challenge.participants.length === 0 ? (
                  <p className="text-sm text-gray-400">Ingen har gått med ännu.</p>
                ) : (
                  <div className="space-y-2">
                    {challenge.participants.map((p) => (
                      <Link key={p.id} href={`/profil/${p.profile.username}`}
                        className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl p-1.5 -mx-1.5 transition-colors">
                        {p.profile.avatarUrl ? (
                          <Image src={p.profile.avatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">
                            {p.profile.username?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{p.profile.username}</span>
                      </Link>
                    ))}
                    {challenge._count.participants > 20 && (
                      <p className="text-xs text-gray-400 pt-1">och {challenge._count.participants - 20} till...</p>
                    )}
                  </div>
                )}
              </div>

              <Link href="/utmaningar"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Alla utmaningar
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
