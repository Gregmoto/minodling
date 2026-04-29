import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";

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
    authors: [{ name: s.siteName }],
    creator: s.siteName,
    openGraph: {
      type: "website",
      locale: "sv_SE",
      url: s.seoCanonical,
      title: s.seoTitle,
      description: s.seoDescription,
      siteName: s.siteName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: s.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle,
      description: s.seoDescription,
      images: [ogImage],
    },
    robots: s.seoRobots,
    metadataBase: new URL(s.seoCanonical),
    verification: {
      ...(s.googleVerification && { google: s.googleVerification }),
    },
    other: {
      ...(s.bingVerification && { "msvalidate.01": s.bingVerification }),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#4A7C59",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="sv" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <JsonLd data={[organizationSchema(settings), websiteSchema(settings)]} />
        {children}
        <GoogleAnalytics gaId={settings.gaId} gaScript={settings.gaScript} />
      </body>
    </html>
  );
}
