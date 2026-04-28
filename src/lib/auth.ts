import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export type UserRole = "admin" | "moderator" | "user";

// ── Hämta inloggad Supabase-användare ─────────────────────────
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

// ── Hämta profil + roll från databasen ────────────────────────
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  return prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      points: true,
    },
  });
}

// ── Hämta enbart rollen ────────────────────────────────────────
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  if (!profile) return null;
  return profile.role as UserRole;
}

// ── Kräv inloggning – redirectar annars ───────────────────────
export async function requireAuth(redirectTo = "/auth/login") {
  const user = await getCurrentUser();
  if (!user) redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectTo)}`);
  return user;
}

// ── Kräv admin-roll ───────────────────────────────────────────
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return profile;
}

// ── Kräv admin eller moderator ────────────────────────────────
export async function requireModerator() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await getUserProfile();
  if (!profile || !["admin", "moderator"].includes(profile.role)) redirect("/dashboard");

  return profile;
}

// ── Kontrollera om användare har en viss roll ─────────────────
export function hasRole(role: UserRole, required: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = { user: 0, moderator: 1, admin: 2 };
  return hierarchy[role] >= hierarchy[required];
}
