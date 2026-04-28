import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  const baseUrl = s.seoCanonical;
  const noindex = s.seoRobots.toLowerCase().includes("noindex");

  if (noindex) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/"],
      },
    ],
    sitemap: s.seoSitemapEnabled ? `${baseUrl}/sitemap.xml` : undefined,
    host: baseUrl,
  };
}
