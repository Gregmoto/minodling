import { unstable_cache } from "next/cache";
import prisma from "./prisma";

// ── Nycklar ─────────────────────────────────────────────────────
export const SETTINGS = {
  // Analytics
  GA_ID:                "analytics_ga_id",
  GA_SCRIPT:            "analytics_ga_script",
  GOOGLE_VERIFICATION:  "analytics_google_verification",
  BING_VERIFICATION:    "analytics_bing_verification",
  // SEO
  SEO_TITLE:            "seo_default_title",
  SEO_DESCRIPTION:      "seo_default_description",
  SEO_OG_IMAGE:         "seo_og_image",
  SEO_ROBOTS:           "seo_robots",
  SEO_SITEMAP:          "seo_sitemap_enabled",
  SEO_CANONICAL:        "seo_canonical_url",
  // Site
  SITE_NAME:            "site_name",
  SITE_FOOTER:          "site_footer_text",
  SITE_EMAIL:           "site_contact_email",
  SITE_INSTAGRAM:       "site_instagram",
  SITE_FACEBOOK:        "site_facebook",
  SITE_TWITTER:         "site_twitter",
  SITE_COOKIE_TEXT:     "site_cookie_text",
} as const;

// ── Typer ────────────────────────────────────────────────────────
export interface SiteSettings {
  gaId:               string | null;
  gaScript:           string | null;
  googleVerification: string | null;
  bingVerification:   string | null;
  seoTitle:           string;
  seoDescription:     string;
  seoOgImage:         string;
  seoRobots:          string;
  seoSitemapEnabled:  boolean;
  seoCanonical:       string;
  siteName:           string;
  footerText:         string;
  contactEmail:       string;
  instagram:          string | null;
  facebook:           string | null;
  twitter:            string | null;
  cookieText:         string;
}

// ── Standardvärden ───────────────────────────────────────────────
export const SETTING_DEFAULTS: SiteSettings = {
  gaId:               null,
  gaScript:           null,
  googleVerification: null,
  bingVerification:   null,
  seoTitle:           "Minodling – Sveriges odlingscommunity",
  seoDescription:     "Dela din trädgårdspassion, få tips och inspiration från svenska odlare.",
  seoOgImage:         "/og-image.jpg",
  seoRobots:          "index, follow",
  seoSitemapEnabled:  true,
  seoCanonical:       "https://minodling.se",
  siteName:           "Minodling",
  footerText:         "Byggt med kärlek för svenska odlare 🌱",
  contactEmail:       "hej@minodling.se",
  instagram:          null,
  facebook:           null,
  twitter:            null,
  cookieText:         "Vi använder cookies för att förbättra din upplevelse på Minodling.",
};

// ── Cached loader ────────────────────────────────────────────────
export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const rows = await prisma.adminSetting.findMany();
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));

      const get = (key: string, fallback: string) =>
        map[key] && map[key].trim() !== "" ? map[key] : fallback;
      const getNullable = (key: string) =>
        map[key] && map[key].trim() !== "" ? map[key] : null;

      return {
        gaId:               getNullable(SETTINGS.GA_ID),
        gaScript:           getNullable(SETTINGS.GA_SCRIPT),
        googleVerification: getNullable(SETTINGS.GOOGLE_VERIFICATION),
        bingVerification:   getNullable(SETTINGS.BING_VERIFICATION),
        seoTitle:           get(SETTINGS.SEO_TITLE,       SETTING_DEFAULTS.seoTitle),
        seoDescription:     get(SETTINGS.SEO_DESCRIPTION, SETTING_DEFAULTS.seoDescription),
        seoOgImage:         get(SETTINGS.SEO_OG_IMAGE,    SETTING_DEFAULTS.seoOgImage),
        seoRobots:          get(SETTINGS.SEO_ROBOTS,      SETTING_DEFAULTS.seoRobots),
        seoSitemapEnabled:  get(SETTINGS.SEO_SITEMAP,     "true") === "true",
        seoCanonical:       get(SETTINGS.SEO_CANONICAL,   SETTING_DEFAULTS.seoCanonical),
        siteName:           get(SETTINGS.SITE_NAME,       SETTING_DEFAULTS.siteName),
        footerText:         get(SETTINGS.SITE_FOOTER,     SETTING_DEFAULTS.footerText),
        contactEmail:       get(SETTINGS.SITE_EMAIL,      SETTING_DEFAULTS.contactEmail),
        instagram:          getNullable(SETTINGS.SITE_INSTAGRAM),
        facebook:           getNullable(SETTINGS.SITE_FACEBOOK),
        twitter:            getNullable(SETTINGS.SITE_TWITTER),
        cookieText:         get(SETTINGS.SITE_COOKIE_TEXT, SETTING_DEFAULTS.cookieText),
      };
    } catch {
      return SETTING_DEFAULTS;
    }
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 300 }
);
