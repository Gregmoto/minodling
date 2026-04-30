export const revalidate = 60;
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, MapPin, Lock, Globe, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { joinGroup, leaveGroup, deleteGroup } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = await prisma.group.findUnique({ where: { slug }, select: { name: true, description: true } });
  if (!g) return { title: "Grupp hittades inte" };
  return { title: `${g.name} – Odlargrupp`, description: g.description ?? undefined };
}

export default async function GroupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const group = await prisma.group.findUnique({
    where: { slug },
    include: {
      creator: { select: { id: true, username: true, avatarUrl: true } },
      members: {
        orderBy: { createdAt: "asc" },
        take: 24,
        include: {
          profile: { select: { id: true, username: true, avatarUrl: true, fullName: true } },
        },
      },
      _count: { select: { members: true } },
    },
  });

  if (!group) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  }) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const myMembership = navProfile
    ? group.members.find((m) => m.profile.id === navProfile.id) ?? null
    : null;

  // Hämta fler medlemmar om det finns fler än 24
  const totalMembers = group._count.members;

  const isMember  = !!myMembership;
  const isAdmin   = myMembership?.role === "admin" || navProfile?.role === "admin";
  const isCreator = group.createdBy === navProfile?.id;
  const canDelete = isCreator || navProfile?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        {group.imageUrl ? (
          <div className="relative h-52 sm:h-64 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 container-main py-6">
              <h1 className="text-3xl font-bold text-white">{group.name}</h1>
            </div>
          </div>
        ) : (
          <div className={`py-10 border-b border-gray-100 ${
            group.category === "region"
              ? "bg-gradient-to-br from-blue-50 to-sky-100"
              : "bg-gradient-to-br from-green-50 to-emerald-100"
          }`}>
            <div className="container-main">
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            </div>
          </div>
        )}

        <div className="container-main py-8">
          <Link href="/grupper" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Alla grupper
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Huvudinnehåll */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Info-kort */}
              <Card className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {group.category === "region" ? "📍 Regiongrupp" : "🌱 Intressegrupp"}
                  </Badge>
                  <Badge variant="outline">
                    {group.groupType === "public"
                      ? <><Globe className="h-3 w-3 inline mr-1" />Öppen</>
                      : <><Lock className="h-3 w-3 inline mr-1" />Privat</>}
                  </Badge>
                  {group.location && (
                    <Badge variant="outline">
                      <MapPin className="h-3 w-3 inline mr-1" />{group.location}
                    </Badge>
                  )}
                </div>

                {group.description && (
                  <p className="text-gray-700 leading-relaxed">{group.description}</p>
                )}

                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  Skapad av
                  <Link href={`/profil/${group.creator.username}`} className="text-green-700 hover:underline font-medium">
                    {group.creator.username}
                  </Link>
                  · {formatDate(group.createdAt)}
                </div>
              </Card>

              {/* Gruppflöde – placeholder */}
              <Card>
                <div className="text-center py-10">
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-gray-500 font-medium mb-1">Gruppflöde kommer snart</p>
                  <p className="text-sm text-gray-400">Här kommer medlemmar kunna dela inlägg, bilder och tips med varandra.</p>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-6">
              {/* Gå med / lämna */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {totalMembers} {totalMembers === 1 ? "medlem" : "medlemmar"}
                  </span>
                </div>

                {user ? (
                  isMember ? (
                    <div className="space-y-2">
                      <div className="w-full py-2.5 text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl">
                        ✓ Du är medlem
                      </div>
                      {!isCreator && (
                        <form action={async () => { "use server"; await leaveGroup(group.id); }}>
                          <button type="submit" className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
                            Lämna gruppen
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <form action={async () => { "use server"; await joinGroup(group.id); }}>
                      <button type="submit" className="w-full py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
                        {group.groupType === "public" ? "Gå med i gruppen" : "Ansök om medlemskap"}
                      </button>
                    </form>
                  )
                ) : (
                  <Link href="/auth/logga-in"
                    className="block w-full py-2.5 text-center bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
                    Logga in för att gå med
                  </Link>
                )}
              </Card>

              {/* Medlemslista */}
              <Card>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Medlemmar</p>
                <div className="space-y-2">
                  {group.members.map((m) => (
                    <Link key={m.id} href={`/profil/${m.profile.username}`}
                      className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors group">
                      {m.profile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.profile.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 text-sm font-bold shrink-0">
                          {m.profile.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors truncate">
                          {m.profile.fullName ?? m.profile.username}
                        </p>
                        {m.role === "admin" && (
                          <p className="text-xs text-amber-600">Admin</p>
                        )}
                      </div>
                    </Link>
                  ))}
                  {totalMembers > 24 && (
                    <p className="text-xs text-gray-400 pt-1">+{totalMembers - 24} fler medlemmar</p>
                  )}
                </div>
              </Card>

              {/* Admin-åtgärder */}
              {canDelete && (
                <Card>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Adminåtgärder</p>
                  <form action={async () => { "use server"; await deleteGroup(group.id); }}>
                    <button type="submit"
                      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 className="h-4 w-4" /> Ta bort gruppen
                    </button>
                  </form>
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
