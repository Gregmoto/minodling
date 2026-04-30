"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const data = {
    fullName:        (formData.get("fullName")        as string | null) || null,
    bio:             (formData.get("bio")             as string | null) || null,
    location:        (formData.get("location")        as string | null) || null,
    growingZone:     (formData.get("growingZone")     as string | null) || null,
    growingType:     (formData.get("growingType")     as string | null) || null,
    experienceLevel: (formData.get("experienceLevel") as string | null) || null,
  };

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data,
    select: { username: true },
  });

  revalidatePath(`/profil/${profile.username}`);
  revalidatePath("/dashboard");
  redirect(`/profil/${profile.username}/redigera?sparad=1`);
}

export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  const user = await requireAuth();

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Ingen fil vald" };
  if (file.size > 5 * 1024 * 1024) return { error: "Filen är för stor (max 5 MB)" };
  if (!file.type.startsWith("image/")) return { error: "Endast bilder är tillåtna" };

  const supabase = await createServerClient();

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: { avatarUrl },
    select: { username: true },
  });

  revalidatePath(`/profil/${profile.username}`);
  revalidatePath("/dashboard");

  return { url: avatarUrl };
}
