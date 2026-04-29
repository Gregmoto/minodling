"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function addPlantTip(plantId: string, content: string) {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("Profil saknas");
  if (!content.trim() || content.length < 5) throw new Error("Tipset är för kort");
  if (content.length > 1000) throw new Error("Max 1000 tecken");

  await prisma.plantTip.create({
    data: {
      plantId,
      userId: profile.id,
      content: content.trim(),
      status: "published",
    },
  });

  const plant = await prisma.plant.findUnique({
    where: { id: plantId },
    select: { slug: true },
  });
  if (plant) revalidatePath(`/vaxtdatabas/${plant.slug}`);
}

export async function uploadPlantImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAuth();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "Ingen fil vald" };
  if (file.size > 10 * 1024 * 1024) return { error: "Max 10 MB" };
  if (!file.type.startsWith("image/")) return { error: "Endast bilder" };

  const supabase = await createServerClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `plants/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("plants")
    .upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("plants").getPublicUrl(path);
  return { url: data.publicUrl };
}
