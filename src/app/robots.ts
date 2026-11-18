import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

// Renderas vid varje anrop. Bygget i Coolify når inte databasen, så en
// förrenderad version skulle sakna alla databasposter tills den förnyats.
export const dynamic = "force-dynamic";

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
