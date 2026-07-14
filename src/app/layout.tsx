import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { GoogleTags } from "@/components/analytics/GoogleTags";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const ogImage = s.seoOgImage.startsWith("http")
    ? s.seoOgImage
    : `${s.seoCanonical}${s.seoOgImage}`;

  return {
    title: {
      default: s.seoTitle,
      template: `%s | ${s.siteName}`,
    },
    description: s.seoDescription,
    keywords: [
      "odling", "trädgård", "community", "odlingstips",
      "grönsaker", "Sverige", "forum", "trädgårdsodling", "självhushållning",
    ],
    authors:  [{ name: s.siteName }],
    creator:  s.siteName,
    openGraph: {
      type:        "website",
      locale:      "sv_SE",
      url:         s.seoCanonical,
      title:       s.seoTitle,
      description: s.seoDescription,
      siteName:    s.siteName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: s.siteName }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       s.seoTitle,
      description: s.seoDescription,
      images:      [ogImage],
    },
    robots:      s.seoRobots || "index, follow",
    metadataBase: new URL(s.seoCanonical),
    icons: {
      icon:     [{ url: "/icon.svg", type: "image/svg+xml" }],
      shortcut: "/icon.svg",
      // apple-touch-icon sköts av app/apple-icon.tsx (Next.js fil-konvention)
      // Dubbel deklaration här orsakar konflikterande <link>-taggar
    },
    verification: {
      ...(s.googleVerification && { google: s.googleVerification }),
    },
    other: {
      ...(s.bingVerification && { "msvalidate.01": s.bingVerification }),
    },
  };
}

export const viewport: Viewport = {
  themeColor:    "#4A7C59",
  width:         "device-width",
  initialScale:  1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="sv" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Explicit apple-touch-icon – mer tillförlitligt än Next.js metadata på iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Google Consent Mode v2 + AdSense + GA (samtycke via Googles CMP) */}
        <GoogleTags gaId={settings.gaId} gaScript={settings.gaScript} />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <JsonLd data={[organizationSchema(settings), websiteSchema(settings)]} />

        {children}

        {/* Samtycke sköts av Googles "European regulations message" (CMP) via
            Consent Mode v2 – se GoogleTags i <head>. Vercel Analytics är cookielöst. */}
        <Analytics />
      </body>
    </html>
  );
}
