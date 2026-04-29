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
    { label: "Växtdiagnos", href: "/vaxtdiagnos" },
    { label: "Guider", href: "/guider" },
    { label: "Ordlista", href: "/ordlista" },
    { label: "Kunskapsbank", href: "/kunskapsbank" },
    { label: "Grupper", href: "/grupper" },
    { label: "Fröbyte", href: "/frobyte" },
    { label: "Utmaningar", href: "/utmaningar" },
    { label: "Premium", href: "/premium" },
    { label: "Min odling", href: "/min-odling" },
  ],
} as const;
