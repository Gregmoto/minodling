export const revalidate = 60;
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { GroupCard } from "@/components/grupper/GroupCard";

export const metadata: Metadata = {
  title: "Odlargrupper – Hitta din lokala odlingsgemenskap",
  description: "Hitta och gå med i lokala odlargrupper och intressegrupper i Sverige. Dela tips, ställ frågor och odla tillsammans.",
};

export default async function GrupperPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; q?: string }>;
}) {
  const params   = await searchParams;
  const kategori = params.kategori ?? "";
  const q        = params.q ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await import("@/lib/prisma").then((m) =>
    m.default.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
    })
  ) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const [groups, myMembershipIds] = await Promise.all([
    prisma.group.findMany({
      where: {
        AND: [
          kategori ? { category: kategori } : {},
          q        ? { name: { contains: q, mode: "insensitive" } } : {},
        ],
      },
      orderBy: { members: { _count: "desc" } },
      take: 60,
      select: {
        id: true, name: true, slug: true, description: true,
        location: true, category: true, imageUrl: true,
        _count: { select: { members: true } },
      },
    }),
    navProfile
      ? prisma.groupMember.findMany({
          where: { userId: navProfile.id },
          select: { groupId: true },
        }).then((rows) => new Set(rows.map((r) => r.groupId)))
      : Promise.resolve(new Set<string>()),
  ]);

  const regionGroups   = groups.filter((g) => g.category === "region");
  const interestGroups = groups.filter((g) => g.category === "interest");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-green-50 to-sage-50 border-b border-gray-100 py-10">
          <div className="container-main">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-700" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Odlargrupper</h1>
                </div>
                <p className="text-gray-500 max-w-xl">
                  Hitta lokala odlare nära dig eller gå med i grupper för din favoritinriktning.
                </p>
              </div>
              {user ? (
                <Link href="/grupper/ny"
                  className="flex items-center gap-2 px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors shrink-0 self-start sm:self-auto">
                  <Plus className="h-4 w-4" /> Skapa grupp
                </Link>
              ) : (
                <Link href="/auth/logga-in"
                  className="px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors shrink-0 self-start sm:self-auto">
                  Logga in för att skapa grupp
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container-main py-8">
          <Breadcrumbs items={[{ name: "Odlargrupper", href: "/grupper" }]} className="mb-6" />

          {/* Sök + kategorifilter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <form method="get" className="flex gap-2">
              <input
                name="q" defaultValue={q}
                placeholder="Sök grupp..."
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white w-52"
              />
              {kategori && <input type="hidden" name="kategori" value={kategori} />}
              <button type="submit" className="px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
                Sök
              </button>
            </form>
            <div className="flex gap-2">
              {[
                { value: "",         label: "Alla grupper" },
                { value: "region",   label: "📍 Regiongrupper" },
                { value: "interest", label: "🌱 Intressegrupper" },
              ].map(({ value, label }) => (
                <Link key={value}
                  href={value ? `/grupper?kategori=${value}` : "/grupper"}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    kategori === value ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Inga grupper hittades.</p>
              {user && (
                <Link href="/grupper/ny" className="text-sm text-green-700 hover:underline">
                  Skapa en ny grupp →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {/* Regiongrupper */}
              {(!kategori || kategori === "region") && regionGroups.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📍 Regionbaserade grupper
                    <span className="text-sm font-normal text-gray-400">{regionGroups.length} grupper</span>
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {regionGroups.map((g) => (
                      <GroupCard key={g.id} group={g} isMember={myMembershipIds.has(g.id)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Intressegrupper */}
              {(!kategori || kategori === "interest") && interestGroups.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    🌱 Intressebaserade grupper
                    <span className="text-sm font-normal text-gray-400">{interestGroups.length} grupper</span>
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {interestGroups.map((g) => (
                      <GroupCard key={g.id} group={g} isMember={myMembershipIds.has(g.id)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
