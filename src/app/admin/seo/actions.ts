"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function upsertSeoSetting(formData: FormData) {
  const id          = formData.get("id") as string | null;
  const pageType    = (formData.get("pageType") as string)?.trim();
  const metaTitle   = (formData.get("metaTitle") as string)?.trim() || null;
  const metaDesc    = (formData.get("metaDescription") as string)?.trim() || null;
  const ogImage     = (formData.get("ogImage") as string)?.trim() || null;
  const canonical   = (formData.get("canonicalUrl") as string)?.trim() || null;
  const noindex     = formData.get("noindex") === "true";

  if (!pageType) throw new Error("pageType krävs");

  const data = { metaTitle, metaDescription: metaDesc, ogImage, canonicalUrl: canonical, noindex };

  if (id) {
    await prisma.seoSetting.update({ where: { id }, data: { pageType, ...data } });
  } else {
    // Check if one already exists for this pageType (without pageId)
    const existing = await prisma.seoSetting.findFirst({ where: { pageType, pageId: null } });
    if (existing) {
      await prisma.seoSetting.update({ where: { id: existing.id }, data });
    } else {
      await prisma.seoSetting.create({ data: { pageType, ...data } });
    }
  }

  revalidatePath("/admin/seo");
}

export async function deleteSeoSetting(id: string) {
  await prisma.seoSetting.delete({ where: { id } });
  revalidatePath("/admin/seo");
}
