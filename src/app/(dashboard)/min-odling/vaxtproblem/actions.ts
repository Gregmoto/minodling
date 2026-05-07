"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { getUserProfile, requireAuth } from "@/lib/auth";

async function getProfileId(): Promise<string> {
  await requireAuth();
  const profile = await getUserProfile();
  if (!profile) throw new Error("Profil saknas");
  return profile.id;
}

// ── Status ────────────────────────────────────────────────────────

export async function updateStatus(id: string, status: string) {
  const profileId = await getProfileId();

  await prisma.plantHealthCheck.updateMany({
    where: { id, userId: profileId },
    data:  { status },
  });

  revalidatePath("/min-odling/vaxtproblem");
  revalidatePath(`/min-odling/vaxtproblem/${id}`);
}

// ── Anteckningar ──────────────────────────────────────────────────

export async function updateNotes(id: string, notes: string) {
  const profileId = await getProfileId();

  await prisma.plantHealthCheck.updateMany({
    where: { id, userId: profileId },
    data:  { notes },
  });

  revalidatePath(`/min-odling/vaxtproblem/${id}`);
}

// ── Uppföljningsbild + anteckning ─────────────────────────────────

export async function addFollowUp(formData: FormData) {
  const profileId     = await getProfileId();
  const id            = formData.get("id")    as string;
  const note          = formData.get("note")  as string | null;
  const image         = formData.get("image") as File | null;

  // Ägarskapscheck
  const check = await prisma.plantHealthCheck.findFirst({
    where:  { id, userId: profileId },
    select: { id: true },
  });
  if (!check) throw new Error("Inte behörig");

  let imageUrl: string | undefined;

  if (image && image.size > 0) {
    const supabase = await createClient();
    const ext      = image.type === "image/png" ? "png" : "jpg";
    const filename = `${profileId}/${Date.now()}-followup.${ext}`;
    const buffer   = Buffer.from(await image.arrayBuffer());

    const { error } = await supabase.storage
      .from("plant-health-checks")
      .upload(filename, buffer, { contentType: image.type, upsert: false });

    if (!error) {
      const { data } = supabase.storage.from("plant-health-checks").getPublicUrl(filename);
      imageUrl = data.publicUrl;
    }
  }

  await prisma.plantHealthCheckFollowUp.create({
    data: { healthCheckId: id, imageUrl, note: note || undefined },
  });

  revalidatePath(`/min-odling/vaxtproblem/${id}`);
}

// ── Radera diagnos ────────────────────────────────────────────────

export async function deleteDiagnosis(id: string) {
  const profileId = await getProfileId();

  await prisma.plantHealthCheck.deleteMany({
    where: { id, userId: profileId },
  });

  revalidatePath("/min-odling/vaxtproblem");
}

// ── Skapa påminnelse ──────────────────────────────────────────────

export async function createReminderForCheck(formData: FormData) {
  const profileId     = await getProfileId();
  const healthCheckId = formData.get("healthCheckId") as string;
  const title         = formData.get("title")         as string;
  const dueDate       = formData.get("dueDate")       as string;
  const description   = formData.get("description")   as string | null;

  if (!title || !dueDate) throw new Error("Titel och datum krävs");

  const hc = await prisma.plantHealthCheck.findFirst({
    where:  { id: healthCheckId, userId: profileId },
    select: { plantId: true },
  });
  if (!hc) throw new Error("Inte behörig");

  await prisma.reminder.create({
    data: {
      userId:       profileId,
      plantId:      hc.plantId ?? undefined,
      reminderType: "plant_health",
      title,
      description:  description || undefined,
      dueDate:      new Date(dueDate),
    },
  });

  revalidatePath(`/min-odling/vaxtproblem/${healthCheckId}`);
  revalidatePath("/paminnelser");
}
