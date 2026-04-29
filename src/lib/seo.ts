import type { Metadata } from "next";
import { SETTING_DEFAULTS, type SiteSettings } from "./settings";

// ── Hjälpfunktioner ──────────────────────────────────────────────
export function truncateDescription(text: string, max = 155): string {
  const stripped = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return stripped.length <= max ? stripped : stripped.slice(0, max - 3) + "...";
}

export function canonicalUrl(settings: SiteSettings, path: string): string {
  const base = settings.seoCanonical.replace(/\/$/, "");
  return `${base}${path}`;
}

// ── Gemensamma OG-defaults ───────────────────────────────────────
export function baseOg(settings: SiteSettings) {
  const ogImg = settings.seoOgImage.startsWith("http")
    ? settings.seoOgImage
    : `${settings.seoCanonical}${settings.seoOgImage}`;
  return {
    locale: "sv_SE",
    siteName: settings.siteName,
    images: [{ url: ogImg, width: 1200, height: 630, alt: settings.siteName }],
  };
}

// ── Metadata-fabrik per innehållstyp ────────────────────────────
export function plantMetadata(
  plant: { name: string; seoTitle?: string | null; seoDescription?: string | null; description?: string | null; imageUrl?: string | null },
  settings: SiteSettings,
  path: string
): Metadata {
  const title = plant.seoTitle ?? `Odla ${plant.name} – Tips & Guide`;
  const description = plant.seoDescription
    ?? (plant.description ? truncateDescription(plant.description) : `Allt om att odla ${plant.name}. Såningstider, skötsel och tips från svenska odlare.`);
  const url = canonicalUrl(settings, path);
  const image = plant.imageUrl ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      type: "article",
      url,
      title,
      description,
      ...(image && { images: [{ url: image, width: 800, height: 600, alt: plant.name }] }),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function guideMetadata(
  guide: { title: string; seoTitle?: string | null; seoDescription?: string | null; excerpt?: string | null; imageUrl?: string | null },
  settings: SiteSettings,
  path: string
): Metadata {
  const title = guide.seoTitle ?? `${guide.title} – Guide`;
  const description = guide.seoDescription
    ?? (guide.excerpt ? truncateDescription(guide.excerpt) : `Läs vår guide om ${guide.title} och bli en bättre odlare.`);
  const url = canonicalUrl(settings, path);
  const image = guide.imageUrl ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      type: "article",
      url,
      title,
      description,
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: guide.title }] }),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function articleMetadata(
  article: { title: string; seoTitle?: string | null; seoDescription?: string | null; excerpt?: string | null; imageUrl?: string | null },
  settings: SiteSettings,
  path: string
): Metadata {
  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription
    ?? (article.excerpt ? truncateDescription(article.excerpt) : `Läs om ${article.title} i Minodlings kunskapsbank.`);
  const url = canonicalUrl(settings, path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...baseOg(settings), type: "article", url, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function glossaryMetadata(
  term: { term: string; seoTitle?: string | null; seoDescription?: string | null; shortDescription?: string | null },
  settings: SiteSettings,
  path: string
): Metadata {
  const title = term.seoTitle ?? `${term.term} – Ordlista`;
  const description = term.seoDescription
    ?? (term.shortDescription ? truncateDescription(term.shortDescription) : `Vad betyder ${term.term}? Förklaring i Minodlings odlingsordlista.`);
  const url = canonicalUrl(settings, path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...baseOg(settings), type: "article", url, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function questionMetadata(
  question: { title: string; content: string },
  settings: SiteSettings,
  path: string
): Metadata {
  const title = `${question.title} – Frågor & Svar`;
  const description = truncateDescription(question.content, 155);
  const url = canonicalUrl(settings, path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...baseOg(settings), type: "article", url, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

// ── JSON-LD schema-fabrikar ──────────────────────────────────────
export function organizationSchema(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: settings.seoCanonical,
    logo: `${settings.seoCanonical}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      email: settings.contactEmail,
      contactType: "customer support",
      availableLanguage: "Swedish",
    },
    sameAs: [
      settings.instagram,
      settings.facebook,
      settings.twitter,
    ].filter(Boolean),
  };
}

export function websiteSchema(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: settings.seoCanonical,
    description: settings.seoDescription,
    inLanguage: "sv-SE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${settings.seoCanonical}/forum?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  datePublished: Date;
  dateModified: Date;
  siteName: string;
  seoCanonical: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    ...(opts.imageUrl && { image: opts.imageUrl }),
    datePublished: opts.datePublished.toISOString(),
    dateModified: opts.dateModified.toISOString(),
    publisher: {
      "@type": "Organization",
      name: opts.siteName,
      url: opts.seoCanonical,
    },
    inLanguage: "sv-SE",
  };
}

export function faqSchema(qa: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  seoCanonical: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${seoCanonical}${item.url}`,
    })),
  };
}

export function plantSchema(
  plant: {
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    latinName?: string | null;
    difficultyLevel?: string | null;
  },
  url: string,
  siteName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    name: plant.name,
    headline: `Odla ${plant.name}`,
    description: plant.description ?? `Guide om att odla ${plant.name}`,
    ...(plant.imageUrl && { image: plant.imageUrl }),
    ...(plant.latinName && { alternateName: plant.latinName }),
    url,
    publisher: { "@type": "Organization", name: siteName },
    inLanguage: "sv-SE",
  };
}
