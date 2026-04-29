"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// ── Beräkna nästa datum vid upprepning ────────────────────────────
function nextDueDate(from: Date, interval: string): Date {
  const d = new Date(from);
  switch (interval) {
    case "daily":    d.setDate(d.getDate() + 1);    break;
    case "weekly":   d.setDate(d.getDate() + 7);    break;
    case "biweekly": d.setDate(d.getDate() + 14);   break;
    case "monthly":  d.setMonth(d.getMonth() + 1);  break;
    case "yearly":   d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

// ── Hämta profil ─────────────────────────────────────────────────
async function getProfile(supabaseUserId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId: supabaseUserId },
    select: { id: true },
  });
  if (!profile) throw new Error("Profil saknas");
  return profile;
}

// ── Skapa påminnelse ─────────────────────────────────────────────
export async function createReminder(formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const title          = (formData.get("title")          as string).trim();
  const reminderType   = (formData.get("reminderType")   as string) || "watering";
  const dueDate        = formData.get("dueDate")         as string;
  const description    = (formData.get("description")    as string | null)?.trim() || null;
  const repeatInterval = (formData.get("repeatInterval") as string | null) || "none";
  const diaryId        = (formData.get("diaryId")        as string | null) || null;
  const plantId        = (formData.get("plantId")        as string | null) || null;

  if (!title)   throw new Error("Titel krävs");
  if (!dueDate) throw new Error("Datum krävs");

  await prisma.reminder.create({
    data: {
      userId:         profile.id,
      title,
      reminderType,
      dueDate:        new Date(dueDate),
      description,
      repeatInterval: repeatInterval === "none" ? null : repeatInterval,
      diaryId:        diaryId || null,
      plantId:        plantId || null,
    },
  });

  revalidatePath("/paminnelser");
  revalidatePath("/dashboard");
}

// ── Markera klar (+ skapa nästa om upprepning) ────────────────────
export async function completeReminder(reminderId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    select: {
      userId: true, title: true, reminderType: true,
      dueDate: true, description: true, repeatInterval: true,
      diaryId: true, plantId: true, isCompleted: true,
    },
  });

  if (!reminder || reminder.userId !== profile.id) throw new Error("Inte behörig");

  // Mark current as complete
  await prisma.reminder.update({
    where: { id: reminderId },
    data:  { isCompleted: true },
  });

  // Auto-create next occurrence if repeat is set
  if (reminder.repeatInterval && reminder.repeatInterval !== "none") {
    const next = nextDueDate(reminder.dueDate, reminder.repeatInterval);
    await prisma.reminder.create({
      data: {
        userId:         profile.id,
        title:          reminder.title,
        reminderType:   reminder.reminderType,
        dueDate:        next,
        description:    reminder.description,
        repeatInterval: reminder.repeatInterval,
        diaryId:        reminder.diaryId,
        plantId:        reminder.plantId,
      },
    });
  }

  revalidatePath("/paminnelser");
  revalidatePath("/dashboard");
}

// ── Avmarkera klar ────────────────────────────────────────────────
export async function uncompleteReminder(reminderId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    select: { userId: true },
  });
  if (!reminder || reminder.userId !== profile.id) throw new Error("Inte behörig");

  await prisma.reminder.update({
    where: { id: reminderId },
    data:  { isCompleted: false },
  });

  revalidatePath("/paminnelser");
  revalidatePath("/dashboard");
}

// ── Radera påminnelse ─────────────────────────────────────────────
export async function deleteReminder(reminderId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    select: { userId: true },
  });
  if (!reminder || reminder.userId !== profile.id) throw new Error("Inte behörig");

  await prisma.reminder.delete({ where: { id: reminderId } });
  revalidatePath("/paminnelser");
  revalidatePath("/dashboard");
}
