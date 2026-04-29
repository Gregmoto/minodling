"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { monthFromNum } from "@/lib/calendar";

export async function suggestCalendarEntry(formData: FormData) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("Profil saknas");

  const title    = (formData.get("title")    as string).trim();
  const monthStr = formData.get("month")     as string;
  const taskType = formData.get("taskType")  as string | null;
  const category = formData.get("category")  as string | null;
  const description = (formData.get("description") as string | null)?.trim() || null;

  if (!title || title.length < 3) throw new Error("Titeln måste vara minst 3 tecken");
  const month = parseInt(monthStr);
  if (!month || month < 1 || month > 12) throw new Error("Ogiltig månad");

  // Generate a unique slug
  const baseSlug = slugify(`${title}-${monthStr}`);
  const existing = await prisma.gardenCalendar.count({ where: { slug: { startsWith: baseSlug } } });
  const slug = existing > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

  await prisma.gardenCalendar.create({
    data: {
      title,
      slug,
      month,
      taskType:        taskType   || null,
      category:        category   || null,
      description,
      isUserSuggested: true,
      suggestedBy:     profile.id,
      status:          "pending",
    },
  });

  const monthData = monthFromNum(month);
  if (monthData) revalidatePath(`/odlingskalender/${monthData.slug}`);
  revalidatePath("/odlingskalender");
}
