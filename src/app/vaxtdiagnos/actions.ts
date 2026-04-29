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

// ── Skapa diagnos ─────────────────────────────────────────────────
export async function createDiagnosis(formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const imageUrl    = formData.get("imageUrl") as string;
  const description = (formData.get("description") as string).trim();
  const plantName   = (formData.get("plantName") as string | null)?.trim() || null;
  const plantId     = (formData.get("plantId") as string | null) || null;
  const problemType = (formData.get("problemType") as string | null) || null;

  if (!imageUrl) throw new Error("Bild krävs");
  if (!description) throw new Error("Beskrivning krävs");

  const diagnosis = await prisma.plantDiagnosis.create({
    data: {
      profileId: profile.id,
      imageUrl,
      description,
      plantName,
      plantId: plantId || null,
      problemType,
      status: "open",
    },
  });

  revalidatePath("/vaxtdiagnos");
  redirect(`/vaxtdiagnos/${diagnosis.id}`);
}

// ── Lägg till kommentar ───────────────────────────────────────────
export async function addDiagnosisComment(diagnosisId: string, formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const content = (formData.get("content") as string).trim();
  if (!content) throw new Error("Kommentar får inte vara tom");

  const isExpert = profile.role === "admin" || profile.role === "moderator";

  await prisma.diagnosisComment.create({
    data: {
      diagnosisId,
      profileId: profile.id,
      content,
      isExpert,
    },
  });

  revalidatePath(`/vaxtdiagnos/${diagnosisId}`);
}

// ── Markera kommentar som lösning ─────────────────────────────────
export async function markAsSolution(commentId: string, diagnosisId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const diagnosis = await prisma.plantDiagnosis.findUnique({
    where: { id: diagnosisId },
    select: { profileId: true },
  });
  if (!diagnosis) throw new Error("Diagnos hittades inte");

  const isOwner = diagnosis.profileId === profile.id;
  const isAdmin = profile.role === "admin" || profile.role === "moderator";
  if (!isOwner && !isAdmin) throw new Error("Inte behörig");

  // Avmarkera andra lösningar
  await prisma.diagnosisComment.updateMany({
    where: { diagnosisId },
    data: { isSolution: false },
  });

  await prisma.diagnosisComment.update({
    where: { id: commentId },
    data: { isSolution: true },
  });

  await prisma.plantDiagnosis.update({
    where: { id: diagnosisId },
    data: { status: "resolved" },
  });

  revalidatePath(`/vaxtdiagnos/${diagnosisId}`);
  revalidatePath("/vaxtdiagnos");
}

// ── Uppdatera status (admin) ──────────────────────────────────────
export async function updateDiagnosisStatus(diagnosisId: string, status: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);
  if (profile.role !== "admin" && profile.role !== "moderator") throw new Error("Inte behörig");

  await prisma.plantDiagnosis.update({
    where: { id: diagnosisId },
    data: { status },
  });

  revalidatePath("/admin/vaxtdiagnos");
  revalidatePath(`/vaxtdiagnos/${diagnosisId}`);
}

// ── Ta bort diagnos ───────────────────────────────────────────────
export async function deleteDiagnosis(diagnosisId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const diagnosis = await prisma.plantDiagnosis.findUnique({
    where: { id: diagnosisId },
    select: { profileId: true },
  });
  if (!diagnosis) throw new Error("Diagnos hittades inte");

  const isOwner = diagnosis.profileId === profile.id;
  const isAdmin = profile.role === "admin" || profile.role === "moderator";
  if (!isOwner && !isAdmin) throw new Error("Inte behörig");

  await prisma.plantDiagnosis.delete({ where: { id: diagnosisId } });

  revalidatePath("/vaxtdiagnos");
  revalidatePath("/admin/vaxtdiagnos");
  redirect("/vaxtdiagnos");
}

// ── Ta bort kommentar ─────────────────────────────────────────────
export async function deleteDiagnosisComment(commentId: string, diagnosisId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const comment = await prisma.diagnosisComment.findUnique({
    where: { id: commentId },
    select: { profileId: true },
  });
  if (!comment) throw new Error("Kommentar hittades inte");

  const isOwner = comment.profileId === profile.id;
  const isAdmin = profile.role === "admin" || profile.role === "moderator";
  if (!isOwner && !isAdmin) throw new Error("Inte behörig");

  await prisma.diagnosisComment.delete({ where: { id: commentId } });
  revalidatePath(`/vaxtdiagnos/${diagnosisId}`);
}
