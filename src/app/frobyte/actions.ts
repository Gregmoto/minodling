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

function makeSlug(title: string): string {
  return title.toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Skapa annons ──────────────────────────────────────────────────
export async function createExchange(formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const title        = (formData.get("title")        as string).trim();
  const description  = (formData.get("description")  as string | null)?.trim() || null;
  const variety      = (formData.get("variety")       as string | null)?.trim() || null;
  const exchangeType = (formData.get("exchangeType")  as string) || "trade";
  const category     = (formData.get("category")      as string | null) || null;
  const location     = (formData.get("location")      as string | null)?.trim() || null;
  const priceRaw     = formData.get("price") as string | null;
  const price        = priceRaw ? parseInt(priceRaw, 10) || null : null;
  const imageUrl     = (formData.get("imageUrl")      as string | null) || null;

  if (!title) throw new Error("Titel krävs");

  let slug = makeSlug(title);
  const existing = await prisma.seedExchange.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const ex = await prisma.seedExchange.create({
    data: { userId: profile.id, title, slug, description, variety, exchangeType, category, location, price, imageUrl, status: "active" },
  });

  revalidatePath("/frobyte");
  redirect(`/frobyte/${ex.id}`);
}

// ── Uppdatera status ──────────────────────────────────────────────
export async function updateExchangeStatus(id: string, status: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const ex = await prisma.seedExchange.findUnique({ where: { id }, select: { userId: true } });
  if (!ex) throw new Error("Annons hittades inte");
  if (ex.userId !== profile.id && profile.role !== "admin") throw new Error("Inte behörig");

  await prisma.seedExchange.update({ where: { id }, data: { status } });
  revalidatePath("/frobyte");
  revalidatePath(`/frobyte/${id}`);
}

// ── Ta bort annons ────────────────────────────────────────────────
export async function deleteExchange(id: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const ex = await prisma.seedExchange.findUnique({ where: { id }, select: { userId: true } });
  if (!ex) throw new Error("Annons hittades inte");
  if (ex.userId !== profile.id && profile.role !== "admin") throw new Error("Inte behörig");

  await prisma.seedExchange.delete({ where: { id } });
  revalidatePath("/frobyte");
  revalidatePath("/admin/frobyte");
  redirect("/frobyte");
}

// ── Rapportera annons ─────────────────────────────────────────────
export async function reportExchange(id: string, reason: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const ex = await prisma.seedExchange.findUnique({ where: { id }, select: { title: true } });
  if (!ex) throw new Error("Annons hittades inte");

  await prisma.report.create({
    data: {
      reporterId: profile.id,
      targetType: "seed_exchange",
      targetId:   id,
      reason,
    },
  });
}
