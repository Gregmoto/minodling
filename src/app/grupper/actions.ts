"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

async function getProfile(supabaseUserId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId: supabaseUserId },
    select: { id: true, role: true },
  });
  if (!profile) throw new Error("Profil saknas");
  return profile;
}

function autoSlug(name: string): string {
  return name.toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Skapa grupp ───────────────────────────────────────────────────
export async function createGroup(formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const name        = (formData.get("name")        as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const location    = (formData.get("location")    as string | null)?.trim() || null;
  const category    = (formData.get("category")    as string) || "interest";
  const groupType   = (formData.get("groupType")   as string) || "public";
  const imageUrl    = (formData.get("imageUrl")    as string | null) || null;

  if (!name) throw new Error("Namn krävs");

  let slug = autoSlug(name);
  // Se till att sluggen är unik
  const existing = await prisma.group.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const group = await prisma.group.create({
    data: {
      name, slug, description, location, category, groupType, imageUrl,
      createdBy: profile.id,
      members: {
        create: { userId: profile.id, role: "admin" },
      },
    },
  });

  revalidatePath("/grupper");
  redirect(`/grupper/${group.slug}`);
}

// ── Gå med i grupp ────────────────────────────────────────────────
export async function joinGroup(groupId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: profile.id } },
  });
  if (existing) return; // Redan medlem

  await prisma.groupMember.create({
    data: { groupId, userId: profile.id, role: "member" },
  });

  revalidatePath("/grupper");
  revalidatePath(`/grupper`);
}

// ── Lämna grupp ───────────────────────────────────────────────────
export async function leaveGroup(groupId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: profile.id } },
    select: { role: true },
  });
  if (!membership) return;
  if (membership.role === "admin") throw new Error("Admin kan inte lämna sin grupp. Ta bort gruppen istället.");

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: profile.id } },
  });

  revalidatePath("/grupper");
}

// ── Ta bort grupp (admin/skapare) ─────────────────────────────────
export async function deleteGroup(groupId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { createdBy: true } });
  if (!group) throw new Error("Grupp hittades inte");

  const isSiteAdmin = profile.role === "admin";
  const isCreator   = group.createdBy === profile.id;
  if (!isSiteAdmin && !isCreator) throw new Error("Inte behörig");

  await prisma.group.delete({ where: { id: groupId } });
  revalidatePath("/grupper");
  revalidatePath("/admin/grupper");
  redirect("/grupper");
}
