export const revalidate = 60;
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Trophy } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Odlingsutmaningar – Tävla och inspireras",
  description: "Delta i odlingsutmaningar, skicka in dina bidrag och inspireras av andra odlares resultat.",
};

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  active:   "bg-green-100 text-green-700",
  ended:    "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  upcoming: "Kommande", active: "Pågående", ended: "Avslutad",
};

export default async function UtmaningarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filterStatus = params.status ?? "";

  const user = await getCurrentUser();

  const navProfile = user ? await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  }) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const challenges = await prisma.challenge.findMany({
    where: {
      published: true,
      ...(filterStatus ? { status: filterStatus } : {}),
    },
    orderBy: [
      { status: "asc" },   // active first (alphabetically a < e < u)
      { startDate: "desc" },
    ],
    include: {
      _count: { select: { participants: true, entries: true } },
    },
  });

  // Mina deltaganden
  const myParticipations = navProfile
    ? await prisma.challengeParticipant.findMany({
        where: { userId: navProfile.id },
        select: { challengeId: true },
      }).then((rows) => new Set(rows.map((r) => r.challengeId)))
    : new Set<string>();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-gray-100 py-10">
          <div className="container-main">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Odlingsutmaningar</h1>
            </div>
            <p className="text-gray-500 max-w-xl">
              Delta i roliga utmaningar, ladda upp dina resultat och inspireras av andra odlare.
            </p>
          </div>
        </div>

        <div className="container-main py-8">
          <Breadcrumbs items={[{ name: "Utmaningar", href: "/utmaningar" }]} className="mb-6" />

          {/* Statusfilter */}
          <div className="flex gap-2 mb-8">
            {[
              { value: "",         label: "Alla" },
              { value: "active",   label: "🟢 Pågående" },
              { value: "upcoming", label: "🔵 Kommande" },
              { value: "ended",    label: "⚪ Avslutade" },
            ].map(({ value, label }) => (
              <Link key={value}
                href={value ? `/utmaningar?status=${value}` : "/utmaningar"}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  filterStatus === value ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {challenges.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Inga utmaningar hittades.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {challenges.map((c) => (
                <Link key={c.id} href={`/utmaningar/${c.slug}`} className="block group">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
                    {/* Bild */}
                    <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
                      {c.imageUrl ? (
                        <Image src={c.imageUrl} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">🏆</div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status] ?? STATUS_STYLE.upcoming}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>
                      {myParticipations.has(c.id) && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 text-green-700">✓ Deltar</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <h2 className="text-base font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                        {c.title}
                      </h2>
                      {c.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">{c.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                        <span>👥 {c._count.participants} deltagare</span>
                        <span>📸 {c._count.entries} bidrag</span>
                        {c.endDate && <span>📅 {formatDate(c.endDate)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
