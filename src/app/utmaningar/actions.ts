"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

async function getProfile(supabaseUserId: string) {
  const p = await prisma.profile.findUnique({
    where: { userId: supabaseUserId },
    select: { id: true, role: true },
  });
  if (!p) throw new Error("Profil saknas");
  return p;
}

function autoSlug(title: string) {
  return title.toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Delta i utmaning ──────────────────────────────────────────────
export async function joinChallenge(challengeId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  await prisma.challengeParticipant.upsert({
    where:  { challengeId_userId: { challengeId, userId: profile.id } },
    create: { challengeId, userId: profile.id },
    update: {},
  });

  revalidatePath("/utmaningar");
}

// ── Lämna utmaning ────────────────────────────────────────────────
export async function leaveChallenge(challengeId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  await prisma.challengeParticipant.deleteMany({
    where: { challengeId, userId: profile.id },
  });

  revalidatePath("/utmaningar");
}

// ── Skicka in bidrag ──────────────────────────────────────────────
export async function submitEntry(challengeId: string, formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const imageUrl = (formData.get("imageUrl") as string | null)?.trim();
  const caption  = (formData.get("caption")  as string | null)?.trim() || null;

  if (!imageUrl) throw new Error("Bild krävs");

  // Kontrollera att användaren är deltagare
  const participant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId: profile.id } },
  });
  if (!participant) throw new Error("Du måste gå med i utmaningen först");

  await prisma.challengeEntry.create({
    data: { challengeId, profileId: profile.id, imageUrl, caption },
  });

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId }, select: { slug: true } });
  revalidatePath(`/utmaningar/${challenge?.slug}`);
}

// ── Kommentera bidrag ─────────────────────────────────────────────
export async function commentEntry(entryId: string, formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const content = (formData.get("content") as string).trim();
  if (!content) throw new Error("Kommentar krävs");

  const entry = await prisma.challengeEntry.findUnique({
    where: { id: entryId },
    include: { challenge: { select: { slug: true } } },
  });
  if (!entry) throw new Error("Bidrag hittades inte");

  await prisma.challengeComment.create({
    data: { entryId, profileId: profile.id, content },
  });

  revalidatePath(`/utmaningar/${entry.challenge.slug}`);
}

// ── Ta bort bidrag ────────────────────────────────────────────────
export async function deleteEntry(entryId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const entry = await prisma.challengeEntry.findUnique({
    where: { id: entryId },
    include: { challenge: { select: { slug: true } } },
  });
  if (!entry) throw new Error("Bidrag hittades inte");

  if (entry.profileId !== profile.id && profile.role !== "admin") throw new Error("Inte behörig");

  await prisma.challengeEntry.delete({ where: { id: entryId } });
  revalidatePath(`/utmaningar/${entry.challenge.slug}`);
}

// ── Ta bort kommentar ─────────────────────────────────────────────
export async function deleteChallengeComment(commentId: string, slug: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const comment = await prisma.challengeComment.findUnique({
    where: { id: commentId }, select: { profileId: true },
  });
  if (!comment) throw new Error("Kommentar hittades inte");
  if (comment.profileId !== profile.id && profile.role !== "admin") throw new Error("Inte behörig");

  await prisma.challengeComment.delete({ where: { id: commentId } });
  revalidatePath(`/utmaningar/${slug}`);
}

// ── Admin: Skapa utmaning ─────────────────────────────────────────
export async function createChallenge(formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);
  if (profile.role !== "admin") throw new Error("Inte behörig");

  const title       = (formData.get("title")       as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const rules       = (formData.get("rules")       as string | null)?.trim() || null;
  const category    = (formData.get("category")    as string | null) || null;
  const imageUrl    = (formData.get("imageUrl")    as string | null) || null;
  const startDate   = formData.get("startDate")  ? new Date(formData.get("startDate") as string) : null;
  const endDate     = formData.get("endDate")    ? new Date(formData.get("endDate")   as string) : null;
  const status      = (formData.get("status")      as string) || "upcoming";
  const published   = formData.get("published") === "true";

  if (!title) throw new Error("Titel krävs");

  let slug = autoSlug(title);
  const exists = await prisma.challenge.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.challenge.create({
    data: { title, slug, description, rules, category, imageUrl, startDate, endDate, status, published },
  });

  revalidatePath("/utmaningar");
  revalidatePath("/admin/utmaningar");
  redirect("/admin/utmaningar");
}

// ── Admin: Uppdatera utmaning ─────────────────────────────────────
export async function updateChallenge(id: string, formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);
  if (profile.role !== "admin") throw new Error("Inte behörig");

  const title       = (formData.get("title")       as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const rules       = (formData.get("rules")       as string | null)?.trim() || null;
  const category    = (formData.get("category")    as string | null) || null;
  const imageUrl    = (formData.get("imageUrl")    as string | null) || null;
  const startDate   = formData.get("startDate")  ? new Date(formData.get("startDate") as string) : null;
  const endDate     = formData.get("endDate")    ? new Date(formData.get("endDate")   as string) : null;
  const status      = (formData.get("status")      as string) || "upcoming";
  const published   = formData.get("published") === "true";

  const c = await prisma.challenge.update({
    where: { id },
    data: { title, description, rules, category, imageUrl, startDate, endDate, status, published },
  });

  revalidatePath("/utmaningar");
  revalidatePath(`/utmaningar/${c.slug}`);
  revalidatePath("/admin/utmaningar");
  redirect("/admin/utmaningar");
}

// ── Admin: Ta bort utmaning ───────────────────────────────────────
export async function deleteChallenge(id: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);
  if (profile.role !== "admin") throw new Error("Inte behörig");

  await prisma.challenge.delete({ where: { id } });
  revalidatePath("/utmaningar");
  revalidatePath("/admin/utmaningar");
  redirect("/admin/utmaningar");
}
