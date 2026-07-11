import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSettings();
  if (!s.seoSitemapEnabled) return [];

  const base = s.seoCanonical.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                      lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/forum`,           lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/fragor`,          lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/vaxtdatabas`,     lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/guider`,          lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/kunskapsbank`,    lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/ordlista`,        lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/butik`,           lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/odlingskalender`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/utmaningar`,      lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/grupper`,         lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/frobyte`,         lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/vaxtdiagnos`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/vaxtidentifiering`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/premium`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/nyhetsbrev`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/om-oss`,          lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/kontakt`,         lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [posts, questions, plants, guides, articles, terms, shopProducts, shopCategories] = await Promise.all([
      prisma.post.findMany({
        where: { status: "published" },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 200,
      }),
      prisma.question.findMany({
        where: { status: { not: "hidden" } },
        select: { slug: true, updatedAt: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.plant.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { name: "asc" },
      }),
      prisma.guide.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.knowledgeArticle.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.glossaryTerm.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { term: "asc" },
      }),
      prisma.shopProduct.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }).catch(() => []),
      prisma.shopCategory.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }).catch(() => []),
    ]);

    return [
      ...staticRoutes,
      ...posts.map((p) => ({
        url: `${base}/forum/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...questions.map((q) => ({
        url: `${base}/fragor/${q.slug}`,
        lastModified: q.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...plants.map((p) => ({
        url: `${base}/vaxtdatabas/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...guides.map((g) => ({
        url: `${base}/guider/${g.slug}`,
        lastModified: g.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...articles.map((a) => ({
        url: `${base}/kunskapsbank/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...terms.map((t) => ({
        url: `${base}/ordlista/${t.slug}`,
        lastModified: t.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...shopProducts.map((p) => ({
        url: `${base}/butik/produkt/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...shopCategories.map((c) => ({
        url: `${base}/butik/kategori/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
