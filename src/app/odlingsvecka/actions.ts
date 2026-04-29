"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateWeeklyTasks, getISOWeek } from "@/lib/weeklyTasks";

async function getProfile(supabaseUserId: string) {
  const p = await prisma.profile.findUnique({
    where:  { userId: supabaseUserId },
    select: { id: true },
  });
  if (!p) throw new Error("Profil saknas");
  return p;
}

/** Markera uppgift som klar / inte klar */
export async function toggleWeeklyTask(taskId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const task = await prisma.weeklyTask.findUnique({ where: { id: taskId } });
  if (!task || task.profileId !== profile.id) throw new Error("Uppgift hittades inte");

  await prisma.weeklyTask.update({
    where: { id: taskId },
    data:  {
      done:   !task.done,
      doneAt: !task.done ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/odlingsvecka");
}

/** Generera om veckans uppgifter */
export async function regenerateWeeklyTasks() {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const { weekYear, weekNumber } = getISOWeek(new Date());

  // Ta bort befintliga system-uppgifter (behåll manuellt tillagda)
  await prisma.weeklyTask.deleteMany({
    where: { profileId: profile.id, weekYear, weekNumber },
  });

  await generateWeeklyTasks(profile.id);

  revalidatePath("/dashboard");
  revalidatePath("/odlingsvecka");
}

/** Lägg till en manuell uppgift (premium-förberedelse) */
export async function addManualWeeklyTask(formData: FormData) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const title = (formData.get("title") as string | null)?.trim();
  if (!title) throw new Error("Titel krävs");

  const { weekYear, weekNumber } = getISOWeek(new Date());

  const count = await prisma.weeklyTask.count({
    where: { profileId: profile.id, weekYear, weekNumber },
  });

  await prisma.weeklyTask.create({
    data: {
      profileId: profile.id,
      weekYear,
      weekNumber,
      title,
      description: (formData.get("description") as string | null)?.trim() || null,
      icon:        "✏️",
      source:      "manual",
      sourceId:    null,
      sortOrder:   count,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/odlingsvecka");
}

/** Ta bort en manuell uppgift */
export async function deleteWeeklyTask(taskId: string) {
  const user    = await requireAuth();
  const profile = await getProfile(user.id);

  const task = await prisma.weeklyTask.findUnique({ where: { id: taskId } });
  if (!task || task.profileId !== profile.id) throw new Error("Uppgift hittades inte");
  if (task.source !== "manual") throw new Error("Bara manuella uppgifter kan tas bort");

  await prisma.weeklyTask.delete({ where: { id: taskId } });

  revalidatePath("/dashboard");
  revalidatePath("/odlingsvecka");
}
