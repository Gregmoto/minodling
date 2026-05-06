"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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

interface PlantLink { plantId: string; relationType: string; }

function parsePlantLinks(formData: FormData): PlantLink[] {
  const raw = formData.get("plantLinks") as string | null;
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const shortDescription = (formData.get("shortDescription") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string | null)?.trim() || null;
  const price = parseSEKtoOre(formData.get("price"));
  const compareAtPrice = parseOptionalSEKtoOre(formData.get("compareAtPrice"));
  const sku = (formData.get("sku") as string | null)?.trim() || null;
  const stockQuantity = parseInt(String(formData.get("stockQuantity") ?? "0"), 10);
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const plantLinks = parsePlantLinks(formData);

  const difficultyLevel = (formData.get("difficultyLevel") as string | null)?.trim() || null;
  const growingType = (formData.get("growingType") as string | null)?.trim() || null;

  const product = await prisma.shopProduct.create({
    data: {
      name, slug, shortDescription, description, imageUrl,
      categoryId: categoryId || null,
      price, compareAtPrice, sku, stockQuantity, isActive, isFeatured,
      seoTitle, seoDescription, difficultyLevel, growingType,
    },
  });

  if (plantLinks.length > 0) {
    await prisma.shopProductPlant.createMany({
      data: plantLinks.map((l) => ({ productId: product.id, plantId: l.plantId, relationType: l.relationType })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/butik/produkter");
  revalidatePath("/butik");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const shortDescription = (formData.get("shortDescription") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string | null)?.trim() || null;
  const price = parseSEKtoOre(formData.get("price"));
  const compareAtPrice = parseOptionalSEKtoOre(formData.get("compareAtPrice"));
  const sku = (formData.get("sku") as string | null)?.trim() || null;
  const stockQuantity = parseInt(String(formData.get("stockQuantity") ?? "0"), 10);
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const difficultyLevel = (formData.get("difficultyLevel") as string | null)?.trim() || null;
  const growingType = (formData.get("growingType") as string | null)?.trim() || null;
  const plantLinks = parsePlantLinks(formData);

  await prisma.shopProduct.update({
    where: { id },
    data: {
      name, slug, shortDescription, description, imageUrl,
      categoryId: categoryId || null,
      price, compareAtPrice, sku, stockQuantity, isActive, isFeatured,
      seoTitle, seoDescription, difficultyLevel, growingType,
    },
  });

  // Ersätt alla växt-kopplingar
  await prisma.shopProductPlant.deleteMany({ where: { productId: id } });
  if (plantLinks.length > 0) {
    await prisma.shopProductPlant.createMany({
      data: plantLinks.map((l) => ({ productId: id, plantId: l.plantId, relationType: l.relationType })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/butik/produkter");
  revalidatePath(`/butik/produkt/${slug}`);
  revalidatePath("/butik");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.shopProduct.delete({ where: { id } });
  revalidatePath("/admin/butik/produkter");
  revalidatePath("/butik");
}

// ── Kategorier ────────────────────────────────────────────────────

/** Snabbskapa kategori direkt från produktformuläret – returnerar id + name */
export async function createQuickCategory(
  name: string
): Promise<{ id: string; name: string } | { error: string }> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { error: "Namn saknas" };
  const slug = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  try {
    const cat = await prisma.shopCategory.create({
      data: { name: trimmed, slug, isActive: true, sortOrder: 0 },
      select: { id: true, name: true },
    });
    revalidatePath("/admin/butik/kategorier");
    revalidatePath("/butik");
    return cat;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    if (msg.includes("Unique constraint")) return { error: "Kategorinamn eller slug finns redan" };
    return { error: msg };
  }
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const seoText = (formData.get("seoText") as string | null)?.trim() || null;
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isActive = formData.get("isActive") === "on";

  await prisma.shopCategory.create({ data: { name, slug, description, imageUrl, seoTitle, seoDescription, seoText, sortOrder, isActive } });
  revalidatePath("/admin/butik/kategorier");
  revalidatePath("/butik");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;
  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() || null;
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() || null;
  const seoText = (formData.get("seoText") as string | null)?.trim() || null;
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isActive = formData.get("isActive") === "on";

  await prisma.shopCategory.update({
    where: { id },
    data: { name, slug, description, imageUrl, seoTitle, seoDescription, seoText, sortOrder, isActive },
  });
  revalidatePath("/admin/butik/kategorier");
  revalidatePath(`/butik/kategori/${slug}`);
  revalidatePath("/butik");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.shopCategory.delete({ where: { id } });
  revalidatePath("/admin/butik/kategorier");
  revalidatePath("/butik");
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
  const discountType = formData.get("discountType") as string;
  const valueRaw = parseFloat(String(formData.get("discountValue") ?? "0"));
  const discountValue = discountType === "percent" ? Math.round(valueRaw) : Math.round(valueRaw * 100);
  const description = (formData.get("description") as string | null)?.trim() || null;
  const minOrderRaw = formData.get("minOrderAmount") as string | null;
  const minOrderAmount = minOrderRaw && minOrderRaw.trim() !== "" ? Math.round(parseFloat(minOrderRaw) * 100) : null;
  const maxUsesRaw = formData.get("maxUses") as string | null;
  const maxUses = maxUsesRaw && maxUsesRaw.trim() !== "" ? parseInt(maxUsesRaw, 10) : null;
  const startsAtRaw = formData.get("startsAt") as string | null;
  const startsAt = startsAtRaw && startsAtRaw.trim() !== "" ? new Date(startsAtRaw) : null;
  const endsAtRaw = formData.get("endsAt") as string | null;
  const endsAt = endsAtRaw && endsAtRaw.trim() !== "" ? new Date(endsAtRaw) : null;
  const isActive = formData.get("isActive") === "on";
  const excludeSaleProducts = formData.get("excludeSaleProducts") === "on";

  await prisma.shopDiscountCode.create({ data: { code, description, discountType, discountValue, minOrderAmount, maxUses, startsAt, endsAt, isActive, excludeSaleProducts } });
  revalidatePath("/admin/butik/rabattkoder");
}

export async function updateDiscount(id: string, formData: FormData) {
  await requireAdmin();
  const code = (formData.get("code") as string).trim().toUpperCase();
  const discountType = formData.get("discountType") as string;
  const valueRaw = parseFloat(String(formData.get("discountValue") ?? "0"));
  const discountValue = discountType === "percent" ? Math.round(valueRaw) : Math.round(valueRaw * 100);
  const description = (formData.get("description") as string | null)?.trim() || null;
  const minOrderRaw = formData.get("minOrderAmount") as string | null;
  const minOrderAmount = minOrderRaw?.trim() ? Math.round(parseFloat(minOrderRaw) * 100) : null;
  const maxUsesRaw = formData.get("maxUses") as string | null;
  const maxUses = maxUsesRaw?.trim() ? parseInt(maxUsesRaw, 10) : null;
  const startsAtRaw = formData.get("startsAt") as string | null;
  const startsAt = startsAtRaw?.trim() ? new Date(startsAtRaw) : null;
  const endsAtRaw = formData.get("endsAt") as string | null;
  const endsAt = endsAtRaw?.trim() ? new Date(endsAtRaw) : null;
  const isActive = formData.get("isActive") === "on";
  const excludeSaleProducts = formData.get("excludeSaleProducts") === "on";
  await prisma.shopDiscountCode.update({
    where: { id },
    data: { code, description, discountType, discountValue, minOrderAmount, maxUses, startsAt, endsAt, isActive, excludeSaleProducts },
  });
  revalidatePath("/admin/butik/rabattkoder");
  revalidatePath(`/admin/butik/rabattkoder/${id}`);
}

export async function toggleDiscount(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.shopDiscountCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/butik/rabattkoder");
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await prisma.shopDiscountCode.delete({ where: { id } });
  revalidatePath("/admin/butik/rabattkoder");
}

// ── Omdömen ───────────────────────────────────────────────────────

export async function updateReviewStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.shopProductReview.update({ where: { id }, data: { status } });
  revalidatePath("/admin/butik/omdomen");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.shopProductReview.delete({ where: { id } });
  revalidatePath("/admin/butik/omdomen");
}

export async function replyToReview(id: string, reply: string) {
  await requireAdmin();
  await prisma.shopProductReview.update({
    where: { id },
    data: {
      adminReply: reply.trim() || null,
      adminRepliedAt: reply.trim() ? new Date() : null,
    },
  });
  revalidatePath("/admin/butik/omdomen");
  revalidatePath(`/admin/butik/omdomen/${id}`);
}

// ── Nyhetsbrev ────────────────────────────────────────────────────

export async function toggleSubscriber(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.shopNewsletterSubscriber.update({
    where: { id },
    data: { isActive, unsubscribedAt: isActive ? null : new Date() },
  });
  revalidatePath("/admin/butik/nyhetsbrev");
}

// ── Inställningar ─────────────────────────────────────────────────

const ALL_SHOP_SETTING_KEYS = [
  "stripe_publishable_key",
  "stripe_secret_key",
  "stripe_webhook_secret",
  "resend_api_key",
  "resend_sender_email",
  "shop_contact_email",
  "trustpilot_bcc_email",
  "shop_shipping_cost",
  "shop_free_shipping_threshold",
  "shop_currency",
  "shop_vat_rate",
  "shop_name",
  "shop_enabled",
  "shop_order_confirmation_text",
  "shop_return_policy",
  "shop_shipping_info",
  "allow_reviews_all",
  "allow_reviews_verified_only",
];

const SECRET_KEYS = ["stripe_secret_key", "stripe_webhook_secret", "resend_api_key"];

export async function saveShopSettings(formData: FormData) {
  await requireAdmin();

  for (const key of ALL_SHOP_SETTING_KEYS) {
    const value = (formData.get(key) as string | null) ?? "";
    // Don't overwrite secret keys if form sent empty (placeholder was shown)
    if (SECRET_KEYS.includes(key) && !value.trim()) continue;
    await prisma.shopSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/admin/butik/installningar");
  revalidateTag("shop-settings"); // Bust cached shipping/shop settings used on public pages
}
