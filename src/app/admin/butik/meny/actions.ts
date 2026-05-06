"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function createNavItem(formData: FormData) {
  await requireAdmin();
  const label     = (formData.get("label") as string)?.trim();
  const href      = (formData.get("href") as string)?.trim();
  const categoryId = (formData.get("categoryId") as string) || null;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  if (!label || !href) throw new Error("Label och länk krävs");

  await prisma.shopNavItem.create({
    data: { label, href, categoryId: categoryId || null, sortOrder },
  });

  revalidateTag("shop-nav");
  revalidatePath("/admin/butik/meny");
}

export async function updateNavItem(id: string, formData: FormData) {
  await requireAdmin();
  const label      = (formData.get("label") as string)?.trim();
  const href       = (formData.get("href") as string)?.trim();
  const categoryId = (formData.get("categoryId") as string) || null;
  const sortOrder  = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive   = formData.get("isActive") === "true";

  await prisma.shopNavItem.update({
    where: { id },
    data: { label, href, categoryId: categoryId || null, sortOrder, isActive },
  });

  revalidateTag("shop-nav");
  revalidatePath("/admin/butik/meny");
}

export async function deleteNavItem(id: string) {
  await requireAdmin();
  await prisma.shopNavItem.delete({ where: { id } });
  revalidateTag("shop-nav");
  revalidatePath("/admin/butik/meny");
}

export async function updateSortOrder(items: { id: string; sortOrder: number }[]) {
  await requireAdmin();
  await Promise.all(
    items.map((item) =>
      prisma.shopNavItem.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
    )
  );
  revalidateTag("shop-nav");
  revalidatePath("/admin/butik/meny");
}
