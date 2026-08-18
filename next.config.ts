import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    // Cloudflare har ingen inbyggd next/image-optimering (Vercel gör det gratis).
    // I CF-bygget serveras originalbilderna. Vill du ha optimering: byt till en
    // custom loader mot Cloudflare Images eller Supabases render-endpoint.
    ...(process.env.CLOUDFLARE_BUILD === "1" ? { unoptimized: true } : {}),
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 år – Next.js Image-optimerade bilder är content-hashed
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // I Cloudflare-bygget pekas @prisma/client om till den workerd-riktade
  // klienten (Prisma "prisma-client"-generatorn). Node/Vercel använder den
  // vanliga. Aliaset gör att inga call-sites behöver ändras.
  ...(process.env.CLOUDFLARE_BUILD === "1"
    ? {
        webpack(config: { resolve: { alias: Record<string, string> } }) {
          config.resolve.alias["@prisma/client"] = path.resolve(
            process.cwd(), "src/generated/prisma-workers",
          );
          return config;
        },
      }
    : { serverExternalPackages: ["@prisma/client"] }),

  // Långa cache-headers för statiska tillgångar
  async headers() {
    return [
      {
        // JS/CSS/bilder som Next.js bygger (content-hashed filnamn)
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Statiska bildfiler i /public
        source: "/:file*.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:file*.jpeg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:file*.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:file*.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:file*.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:file*.woff2",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
