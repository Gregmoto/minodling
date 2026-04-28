export const siteConfig = {
  name: "Minodling",
  tagline: "Sveriges odlingscommunity",
  description:
    "Dela din trädgårdspassion, få tips och inspiration från svenska odlare. Gemenskap för alla som älskar att odla.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://minodling.se",
  ogImage: "/og-image.jpg",
  links: {
    instagram: "https://instagram.com/minodling",
    facebook: "https://facebook.com/minodling",
  },
  nav: [
    { label: "Forum", href: "/forum" },
    { label: "Odlingstips", href: "/odlingstips" },
    { label: "Min odling", href: "/min-odling" },
    { label: "Community", href: "/community" },
  ],
} as const;
