"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── Produkter ──────────────────────────────────────────────────────

function parseSEKtoOre(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  return Math.round(parseFloat(String(value)) * 100);
}

function parseOptionalSEKtoOre(value: FormDataEntryValue | null): number | null {
  if (!value || String(value).trim() === "") return null;
  const n = parseFloat(String(value));
  if (isNaN(n)) return null;
  return Math.round(n * 100);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const shortDesc = (formData.get("shortDesc") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string | null)?.trim() || null;
  const price = parseSEKtoOre(formData.get("price"));
  const comparePrice = parseOptionalSEKtoOre(formData.get("comparePrice"));
  const sku = (formData.get("sku") as string | null)?.trim() || null;
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() || null;
  const seoDesc = (formData.get("seoDesc") as string | null)?.trim() || null;

  await prisma.shopProduct.create({
    data: {
      name, slug, shortDesc, description, imageUrl,
      categoryId: categoryId || null,
      price, comparePrice, sku, stock, isActive, isFeatured, tags, seoTitle, seoDesc,
    },
  });

  revalidatePath("/admin/butik/produkter");
  revalidatePath("/butik");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const shortDesc = (formData.get("shortDesc") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string | null)?.trim() || null;
  const price = parseSEKtoOre(formData.get("price"));
  const comparePrice = parseOptionalSEKtoOre(formData.get("comparePrice"));
  const sku = (formData.get("sku") as string | null)?.trim() || null;
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() || null;
  const seoDesc = (formData.get("seoDesc") as string | null)?.trim() || null;

  await prisma.shopProduct.update({
    where: { id },
    data: {
      name, slug, shortDesc, description, imageUrl,
      categoryId: categoryId || null,
      price, comparePrice, sku, stock, isActive, isFeatured, tags, seoTitle, seoDesc,
    },
  });

  revalidatePath("/admin/butik/produkter");
  revalidatePath("/butik");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.shopProduct.delete({ where: { id } });
  revalidatePath("/admin/butik/produkter");
  revalidatePath("/butik");
}

// ── Kategorier ────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isActive = formData.get("isActive") === "on";

  await prisma.shopCategory.create({ data: { name, slug, description, imageUrl, sortOrder, isActive } });
  revalidatePath("/admin/butik/kategorier");
  revalidatePath("/butik");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.shopCategory.delete({ where: { id } });
  revalidatePath("/admin/butik/kategorier");
}

// ── Ordrar ────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  await prisma.shopOrder.update({ where: { id: orderId }, data: { status } });
  revalidatePath(`/admin/butik/ordrar/${orderId}`);
  revalidatePath("/admin/butik/ordrar");
  revalidatePath("/admin/butik");
}

// ── Rabattkoder ───────────────────────────────────────────────────

export async function createDiscount(formData: FormData) {
  await requireAdmin();

  const code = (formData.get("code") as string).trim().toUpperCase();
  const type = formData.get("type") as string;
  const valueRaw = parseFloat(String(formData.get("value") ?? "0"));
  const value = type === "percent" ? Math.round(valueRaw) : Math.round(valueRaw * 100);
  const minOrderRaw = formData.get("minOrder") as string | null;
  const minOrder = minOrderRaw && minOrderRaw.trim() !== "" ? Math.round(parseFloat(minOrderRaw) * 100) : null;
  const maxUsesRaw = formData.get("maxUses") as string | null;
  const maxUses = maxUsesRaw && maxUsesRaw.trim() !== "" ? parseInt(maxUsesRaw, 10) : null;
  const expiresAtRaw = formData.get("expiresAt") as string | null;
  const expiresAt = expiresAtRaw && expiresAtRaw.trim() !== "" ? new Date(expiresAtRaw) : null;
  const isActive = formData.get("isActive") === "on";

  await prisma.shopDiscount.create({ data: { code, type, value, minOrder, maxUses, expiresAt, isActive } });
  revalidatePath("/admin/butik/rabattkoder");
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await prisma.shopDiscount.delete({ where: { id } });
  revalidatePath("/admin/butik/rabattkoder");
}

// ── Inställningar ─────────────────────────────────────────────────

const SHOP_SETTING_KEYS = [
  "shop_name",
  "shop_enabled",
  "shop_shipping_cost",
  "shop_free_shipping_threshold",
  "shop_currency",
];

export async function saveShopSettings(formData: FormData) {
  await requireAdmin();

  for (const key of SHOP_SETTING_KEYS) {
    const value = (formData.get(key) as string | null) ?? "";
    await prisma.adminSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/admin/butik/installningar");
}
