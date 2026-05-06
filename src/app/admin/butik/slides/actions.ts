"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function createSlide(formData: FormData) {
  await requireAdmin();
  await prisma.shopSlide.create({
    data: {
      title:      (formData.get("title") as string).trim(),
      subtitle:   (formData.get("subtitle") as string)?.trim() || null,
      imageUrl:   (formData.get("imageUrl") as string)?.trim() || null,
      buttonText: (formData.get("buttonText") as string)?.trim() || null,
      buttonUrl:  (formData.get("buttonUrl") as string)?.trim() || null,
      sortOrder:  Number(formData.get("sortOrder") ?? 0),
      isActive:   formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/butik/slides");
  revalidatePath("/butik");
}

export async function updateSlide(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.shopSlide.update({
    where: { id },
    data: {
      title:      (formData.get("title") as string).trim(),
      subtitle:   (formData.get("subtitle") as string)?.trim() || null,
      imageUrl:   (formData.get("imageUrl") as string)?.trim() || null,
      buttonText: (formData.get("buttonText") as string)?.trim() || null,
      buttonUrl:  (formData.get("buttonUrl") as string)?.trim() || null,
      sortOrder:  Number(formData.get("sortOrder") ?? 0),
      isActive:   formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/butik/slides");
  revalidatePath("/butik");
}

export async function deleteSlide(id: string) {
  await requireAdmin();
  await prisma.shopSlide.delete({ where: { id } });
  revalidatePath("/admin/butik/slides");
  revalidatePath("/butik");
}

export async function toggleSlide(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.shopSlide.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/butik/slides");
  revalidatePath("/butik");
}
