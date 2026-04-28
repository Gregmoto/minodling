import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSettings();
  if (!s.seoSitemapEnabled) return [];

  const base = s.seoCanonical;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/forum`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/odlingstips`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/om-oss`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/kontakt`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const [posts, guides] = await Promise.all([
      prisma.post.findMany({
        where: { status: "published" },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 200,
      }),
      prisma.guide.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true },
        take: 100,
      }),
    ]);

    const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${base}/forum/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const guideRoutes: MetadataRoute.Sitemap = guides.map((g) => ({
      url: `${base}/guider/${g.id}`,
      lastModified: g.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...postRoutes, ...guideRoutes];
  } catch {
    return staticRoutes;
  }
}
