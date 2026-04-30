/**
 * Cached navbar user lookup.
 * Called from public page server components so the profile query
 * is served from cache instead of hitting Supabase on every request.
 */
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

export type NavUser = {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: string;
} | null;

const _getNavUser = unstable_cache(
  async (userId: string): Promise<NavUser> => {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
    });
    if (!profile) return null;
    return {
      id: profile.id,
      username: profile.username ?? profile.id,
      displayName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      ...(profile.role ? { role: profile.role } : {}),
    };
  },
  ["nav-user"],
  { revalidate: 60 },
);

export async function getNavUser(userId: string | undefined): Promise<NavUser> {
  if (!userId) return null;
  return _getNavUser(userId);
}
