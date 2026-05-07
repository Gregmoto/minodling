import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
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
  serverExternalPackages: ["@prisma/client"],

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
        // Statiska filer i /public (bilder, fonter, favicon etc.)
        source: "/:path((?!api/).*\\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff2|woff)$)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
