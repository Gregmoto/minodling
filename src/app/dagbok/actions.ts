"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createClient as createServerClient } from "@/lib/supabase/server";

// ── Hämta profil (intern hjälpfunktion) ─────────────────────────
async function getProfile(supabaseUserId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId: supabaseUserId },
    select: { id: true },
  });
  if (!profile) throw new Error("Profil saknas");
  return profile;
}

// ── Verifiera ägarskap för dagbok ────────────────────────────────
async function verifyOwner(diaryId: string, profileId: string) {
  const diary = await prisma.gardenDiary.findUnique({
    where: { id: diaryId },
    select: { userId: true },
  });
  if (!diary) throw new Error("Dagboken hittades inte");
  if (diary.userId !== profileId) throw new Error("Inte behörig");
  return diary;
}

// ── Skapa ny dagbok ──────────────────────────────────────────────
export async function createDiary(formData: FormData) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  const title           = (formData.get("title")           as string).trim();
  const plantId         = (formData.get("plantId")         as string | null) || null;
  const customPlantName = (formData.get("customPlantName") as string | null)?.trim() || null;
  const notes           = (formData.get("notes")           as string | null)?.trim() || null;
  const imageUrl        = (formData.get("imageUrl")        as string | null) || null;
  const sowingDate      = (formData.get("sowingDate")      as string | null) || null;
  const plantingDate    = (formData.get("plantingDate")    as string | null) || null;
  const harvestDate     = (formData.get("harvestDate")     as string | null) || null;

  if (!title) throw new Error("Titel krävs");

  const diary = await prisma.gardenDiary.create({
    data: {
      userId:          profile.id,
      plantId:         plantId || null,
      customPlantName: plantId ? null : customPlantName,
      title,
      notes,
      imageUrl,
      sowingDate:   sowingDate   ? new Date(sowingDate)   : null,
      plantingDate: plantingDate ? new Date(plantingDate) : null,
      harvestDate:  harvestDate  ? new Date(harvestDate)  : null,
    },
  });

  revalidatePath("/dagbok");
  redirect(`/dagbok/${diary.id}`);
}

// ── Uppdatera dagbok ─────────────────────────────────────────────
export async function updateDiary(diaryId: string, formData: FormData) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  await verifyOwner(diaryId, profile.id);

  const title           = (formData.get("title")           as string).trim();
  const notes           = (formData.get("notes")           as string | null)?.trim() || null;
  const imageUrl        = (formData.get("imageUrl")        as string | null) || null;
  const sowingDate      = (formData.get("sowingDate")      as string | null) || null;
  const plantingDate    = (formData.get("plantingDate")    as string | null) || null;
  const harvestDate     = (formData.get("harvestDate")     as string | null) || null;
  const isPublic        = formData.get("isPublic") === "true";

  await prisma.gardenDiary.update({
    where: { id: diaryId },
    data: {
      title,
      notes,
      imageUrl: imageUrl || undefined,
      sowingDate:   sowingDate   ? new Date(sowingDate)   : null,
      plantingDate: plantingDate ? new Date(plantingDate) : null,
      harvestDate:  harvestDate  ? new Date(harvestDate)  : null,
      isPublic,
    },
  });

  revalidatePath(`/dagbok/${diaryId}`);
  revalidatePath("/dagbok");
  redirect(`/dagbok/${diaryId}`);
}

// ── Radera dagbok ────────────────────────────────────────────────
export async function deleteDiary(diaryId: string) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  await verifyOwner(diaryId, profile.id);

  await prisma.gardenDiary.delete({ where: { id: diaryId } });
  revalidatePath("/dagbok");
  redirect("/dagbok");
}

// ── Lägg till tidslinjeinlägg ────────────────────────────────────
export async function addDiaryEntry(formData: FormData) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  const diaryId  = formData.get("diaryId")  as string;
  const type     = formData.get("type")     as string;
  const date     = formData.get("date")     as string;
  const notes    = (formData.get("notes")   as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null) || null;

  if (!diaryId || !type || !date) throw new Error("Obligatoriska fält saknas");

  await verifyOwner(diaryId, profile.id);

  await prisma.diaryEntry.create({
    data: {
      diaryId,
      type,
      date: new Date(date),
      notes,
      imageUrl,
    },
  });

  revalidatePath(`/dagbok/${diaryId}`);
}

// ── Ta bort tidslinjeinlägg ──────────────────────────────────────
export async function deleteDiaryEntry(entryId: string, diaryId: string) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  await verifyOwner(diaryId, profile.id);

  await prisma.diaryEntry.delete({ where: { id: entryId } });
  revalidatePath(`/dagbok/${diaryId}`);
}

// ── Lägg till påminnelse ─────────────────────────────────────────
export async function addReminder(formData: FormData) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  const diaryId      = formData.get("diaryId")      as string;
  const title        = (formData.get("title")        as string).trim();
  const description  = (formData.get("description")  as string | null)?.trim() || null;
  const dueDate      = formData.get("dueDate")       as string;
  const reminderType = (formData.get("reminderType") as string) || "custom";

  if (!title || !dueDate) throw new Error("Titel och datum krävs");

  await verifyOwner(diaryId, profile.id);

  await prisma.reminder.create({
    data: {
      userId:       profile.id,
      diaryId,
      title,
      description,
      dueDate:      new Date(dueDate),
      reminderType,
    },
  });

  revalidatePath(`/dagbok/${diaryId}`);
}

// ── Markera påminnelse som klar ──────────────────────────────────
export async function toggleReminder(reminderId: string, diaryId: string) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    select: { userId: true, isCompleted: true },
  });
  if (!reminder || reminder.userId !== profile.id) throw new Error("Inte behörig");

  await prisma.reminder.update({
    where: { id: reminderId },
    data:  { isCompleted: !reminder.isCompleted },
  });

  revalidatePath(`/dagbok/${diaryId}`);
}

// ── Radera påminnelse ────────────────────────────────────────────
export async function deleteReminder(reminderId: string, diaryId: string) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    select: { userId: true },
  });
  if (!reminder || reminder.userId !== profile.id) throw new Error("Inte behörig");

  await prisma.reminder.delete({ where: { id: reminderId } });
  revalidatePath(`/dagbok/${diaryId}`);
}

// ── Bilduppladdning ──────────────────────────────────────────────
export async function uploadDiaryImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAuth();
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "Ingen fil vald" };
  if (file.size > 10 * 1024 * 1024) return { error: "Max 10 MB" };
  if (!file.type.startsWith("image/")) return { error: "Endast bilder" };

  const supabase = await createServerClient();
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `diary/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("diary")
    .upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("diary").getPublicUrl(path);
  return { url: data.publicUrl };
}
