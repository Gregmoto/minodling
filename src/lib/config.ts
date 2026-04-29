export const siteConfig = {
  name: "Minodling",
  tagline: "Sveriges odlingscommunity",
  description:
    "Dela din trädgårdspassion, få tips och inspiration från svenska odlare. Gemenskap för alla som älskar att odla.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://minodling.se",
  ogImage: "/og-image.jpg",
  links: {
    instagram: "https://instagram.com/minodling",
    facebook:  "https://facebook.com/minodling",
  },
  /** Primära nav-länkar – alltid synliga på desktop */
  navPrimary: [
    { label: "Forum",       href: "/forum" },
    { label: "Guider",      href: "/guider" },
    { label: "Växtdatabas", href: "/vaxtdatabas" },
    { label: "Grupper",     href: "/grupper" },
    { label: "Fröbyte",     href: "/frobyte" },
  ],
  /** Sekundära nav-länkar – i "Mer"-dropdown */
  navMore: [
    { label: "Växtdiagnos",  href: "/vaxtdiagnos" },
    { label: "Ordlista",     href: "/ordlista" },
    { label: "Kunskapsbank", href: "/kunskapsbank" },
    { label: "Utmaningar",   href: "/utmaningar" },
  ],
  /** Behålls för bakåtkompatibilitet */
  get nav() {
    return [...this.navPrimary, ...this.navMore];
  },
} as const;
