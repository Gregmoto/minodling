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
  /** Alla nav-länkar – visas direkt utan dropdown */
  navPrimary: [
    { label: "Forum",            href: "/forum" },
    { label: "Guider",           href: "/guider" },
    { label: "Växtdatabas",      href: "/vaxtdatabas" },
    { label: "Identifiera växt", href: "/vaxtidentifiering" },
    { label: "Frågor & svar",    href: "/fragor" },
    { label: "Fröbyte",          href: "/frobyte" },
    { label: "Butik",            href: "/butik" },
  ],
  /** Sekundärt – visas bara i mobil-menyn */
  navMore: [
    { label: "Grupper",      href: "/grupper" },
    { label: "Kunskapsbank", href: "/kunskapsbank" },
    { label: "Odlingsordlista", href: "/ordlista" },
    { label: "Utmaningar",   href: "/utmaningar" },
  ],
  /** Behålls för bakåtkompatibilitet */
  get nav() {
    return [...this.navPrimary, ...this.navMore];
  },
} as const;
