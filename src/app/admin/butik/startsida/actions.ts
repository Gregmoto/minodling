"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ── HOME LINKS ─────────────────────────────────────────────────

export async function createHomeLink(formData: FormData) {
  await requireAdmin();

  const title     = formData.get("title") as string;
  const url       = formData.get("url") as string;
  const emoji     = (formData.get("emoji") as string) || null;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

  if (!title?.trim() || !url?.trim()) {
    return { error: "Titel och URL krävs." };
  }

  await prisma.shopHomeLink.create({
    data: { title: title.trim(), url: url.trim(), emoji, sortOrder },
  });

  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}

export async function updateHomeLink(id: string, formData: FormData) {
  await requireAdmin();

  const title     = formData.get("title") as string;
  const url       = formData.get("url") as string;
  const emoji     = (formData.get("emoji") as string) || null;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

  if (!title?.trim() || !url?.trim()) {
    return { error: "Titel och URL krävs." };
  }

  await prisma.shopHomeLink.update({
    where: { id },
    data: { title: title.trim(), url: url.trim(), emoji, sortOrder },
  });

  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}

export async function deleteHomeLink(id: string) {
  await requireAdmin();
  await prisma.shopHomeLink.delete({ where: { id } });
  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}

export async function toggleHomeLink(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.shopHomeLink.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}

// ── HOME SECTIONS ──────────────────────────────────────────────

export async function createHomeSection(formData: FormData) {
  await requireAdmin();

  const sectionType = formData.get("sectionType") as string;
  const title       = formData.get("title") as string;

  if (!sectionType || !title?.trim()) {
    return { error: "Sektionstyp och titel krävs." };
  }

  await prisma.shopHomeSection.create({
    data: {
      sectionType:       sectionType.trim(),
      title:             title.trim(),
      subtitle:          (formData.get("subtitle") as string) || null,
      content:           (formData.get("content") as string) || null,
      imageUrl:          (formData.get("imageUrl") as string) || null,
      imageUrl2:         (formData.get("imageUrl2") as string) || null,
      buttonText:        (formData.get("buttonText") as string) || null,
      buttonUrl:         (formData.get("buttonUrl") as string) || null,
      buttonText2:       (formData.get("buttonText2") as string) || null,
      buttonUrl2:        (formData.get("buttonUrl2") as string) || null,
      title2:            (formData.get("title2") as string) || null,
      subtitle2:         (formData.get("subtitle2") as string) || null,
      productCategoryId: (formData.get("productCategoryId") as string) || null,
      plantId:           (formData.get("plantId") as string) || null,
      sortOrder:         parseInt((formData.get("sortOrder") as string) || "0", 10),
    },
  });

  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}

export async function updateHomeSection(id: string, formData: FormData) {
  await requireAdmin();

  const sectionType = formData.get("sectionType") as string;
  const title       = formData.get("title") as string;

  if (!sectionType || !title?.trim()) {
    return { error: "Sektionstyp och titel krävs." };
  }

  await prisma.shopHomeSection.update({
    where: { id },
    data: {
      sectionType:       sectionType.trim(),
      title:             title.trim(),
      subtitle:          (formData.get("subtitle") as string) || null,
      content:           (formData.get("content") as string) || null,
      imageUrl:          (formData.get("imageUrl") as string) || null,
      imageUrl2:         (formData.get("imageUrl2") as string) || null,
      buttonText:        (formData.get("buttonText") as string) || null,
      buttonUrl:         (formData.get("buttonUrl") as string) || null,
      buttonText2:       (formData.get("buttonText2") as string) || null,
      buttonUrl2:        (formData.get("buttonUrl2") as string) || null,
      title2:            (formData.get("title2") as string) || null,
      subtitle2:         (formData.get("subtitle2") as string) || null,
      productCategoryId: (formData.get("productCategoryId") as string) || null,
      plantId:           (formData.get("plantId") as string) || null,
      sortOrder:         parseInt((formData.get("sortOrder") as string) || "0", 10),
    },
  });

  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}

export async function deleteHomeSection(id: string) {
  await requireAdmin();
  await prisma.shopHomeSection.delete({ where: { id } });
  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}

export async function toggleHomeSection(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.shopHomeSection.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/butik/startsida");
  revalidatePath("/butik");
  return { success: true };
}
