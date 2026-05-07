export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User, Lock, Bell, Trash2, ChevronRight, Mail,
  Sprout, MapPin, Leaf, Settings,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = { title: "Inställningar" };

export default async function InstallningarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?redirect=/installningar");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      username: true,
      fullName: true,
      avatarUrl: true,
      bio: true,
      location: true,
      growingZone: true,
      growingType: true,
      experienceLevel: true,
      role: true,
    },
  });

  if (!profile) redirect("/auth/login");

  const experienceLabel: Record<string, string> = {
    beginner:   "🌱 Nybörjare",
    hobbyist:   "🌿 Hobbyodlare",
    experienced:"🌳 Erfaren",
  };
  const growingTypeLabel: Record<string, string> = {
    balcony:    "🪴 Balkong",
    greenhouse: "🏡 Växthus",
    garden:     "🌳 Trädgård",
    indoor:     "🪟 Inomhus",
    allotment:  "🌱 Kolonilott",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Rubrik */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-gray-600" />
          Inställningar
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Hantera ditt konto och dina preferenser
        </p>
      </div>

      {/* ── Profilkort ─────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-4 mb-5">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.fullName ?? profile.username}
            size="lg"
          />
          <div>
            <p className="font-semibold text-gray-900 text-lg">
              {profile.fullName ?? profile.username}
            </p>
            <p className="text-sm text-gray-400">@{profile.username}</p>
            {profile.role === "admin" && (
              <Badge variant="warning" size="sm" className="mt-1">Admin</Badge>
            )}
          </div>
        </div>

        {/* Sammanfattning */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          {profile.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.growingZone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Sprout className="h-4 w-4 text-gray-400 shrink-0" />
              <span>Odlingszon {profile.growingZone}</span>
            </div>
          )}
          {profile.growingType && (
            <div className="flex items-center gap-2 text-gray-600">
              <Leaf className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{growingTypeLabel[profile.growingType] ?? profile.growingType}</span>
            </div>
          )}
          {profile.experienceLevel && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>{experienceLabel[profile.experienceLevel] ?? profile.experienceLevel}</span>
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-500 border-t border-gray-100 pt-4 mb-4 leading-relaxed">
            {profile.bio}
          </p>
        )}

        <Link
          href={`/profil/${profile.username}/redigera`}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 group-hover:text-green-700">Redigera profil</p>
              <p className="text-xs text-gray-400">Namn, bio, plats och odlingsstil</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
        </Link>
      </Card>

      {/* ── Konto-inställningar ─────────────────────────────────── */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Konto</h2>

        <div className="space-y-2">
          {/* E-post */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">E-postadress</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">Hanteras av Supabase</span>
          </div>

          {/* Ändra lösenord */}
          <Link
            href="/auth/uppdatera-losenord"
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700">Ändra lösenord</p>
                <p className="text-xs text-gray-400">Uppdatera ditt lösenord</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
          </Link>
        </div>
      </Card>

      {/* ── Notiser ─────────────────────────────────────────────── */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Notiser</h2>

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
          <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Påminnelser</p>
            <p className="text-xs text-gray-400">Hantera dina odlingspåminnelser</p>
          </div>
          <Link
            href="/paminnelser"
            className="text-xs font-medium text-green-600 hover:text-green-700"
          >
            Öppna →
          </Link>
        </div>
      </Card>

      {/* ── Snabblänkar ─────────────────────────────────────────── */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Min sida</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: `/profil/${profile.username}`, label: "Visa min profil", icon: User },
            { href: "/min-odling", label: "Min odling", icon: Sprout },
            { href: "/paminnelser", label: "Påminnelser", icon: Bell },
            { href: "/min-odling/vaxtidentifiering", label: "Mina identifieringar", icon: Leaf },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group text-sm"
            >
              <item.icon className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
              <span className="text-gray-700 group-hover:text-green-700 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* ── Farozon ─────────────────────────────────────────────── */}
      <Card className="border-red-100">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4">Farozon</h2>
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-100 bg-red-50">
          <Trash2 className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Radera konto</p>
            <p className="text-xs text-red-400 mt-0.5">
              Kontakta oss på{" "}
              <a href="mailto:hej@minodling.se" className="underline">hej@minodling.se</a>{" "}
              för att radera ditt konto.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
