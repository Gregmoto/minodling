export const revalidate = 86400;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Leaf, Users, Sprout, ShoppingBag, Heart, Globe, ArrowRight,
  BookOpen, MessageCircle, Star,
} from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getNavUser } from "@/lib/nav-user";
import { canonicalUrl, baseOg } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const url = canonicalUrl(settings, "/om-oss");
  return {
    title: "Om oss – Minodling",
    description:
      "Minodling är Sveriges odlingscommunity – en mötesplats för alla som älskar att odla. Läs om vår historia, mission och vad vi strävar efter.",
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      title: "Om oss – Minodling",
      description: "Sveriges odlingscommunity för alla som älskar att odla.",
      url,
    },
  };
}

const VALUES = [
  {
    icon: Heart,
    title: "Passion för odling",
    description:
      "Vi tror att odling är mer än en hobby – det är ett sätt att leva i samklang med naturen, ta hand om sig själv och bidra till ett mer hållbart samhälle.",
  },
  {
    icon: Users,
    title: "Gemenskap",
    description:
      "Odling är roligast tillsammans. Vi bygger en öppen, välkomnande community där nybörjare och erfarna odlare delar erfarenheter och stöttar varandra.",
  },
  {
    icon: Globe,
    title: "Hållbarhet",
    description:
      "Ekologisk odling, frösparande och lokal matproduktion är centrala delar av vår filosofi. Vi strävar efter att inspirera till ett mer hållbart förhållningssätt till mat och natur.",
  },
  {
    icon: BookOpen,
    title: "Kunskap",
    description:
      "Vi samlar kunskap och erfarenheter för att göra odling tillgängligt för alla – oavsett om du har en stor trädgård, en balkong eller bara ett fönsterbräde.",
  },
];

const STATS = [
  { value: "10 000+", label: "Registrerade odlare" },
  { value: "500+", label: "Växtguider" },
  { value: "50 000+", label: "Forum-inlägg" },
  { value: "2021", label: "Grundat" },
];

const TEAM = [
  {
    name: "Minodling-teamet",
    role: "Grundare & odlingsentusiaster",
    bio: "Vi är ett litet team av passionerade odlare som ville skapa den plattform vi själva saknade – en plats där svenska odlare kan hitta information, inspiration och gemenskap.",
    emoji: "🌱",
  },
];

export default async function OmOssPage() {
  const user = await getCurrentUser();
  const navUser = await getNavUser(user?.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-white">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-sage-800 via-sage-700 to-green-700 py-20 md:py-28">
          <div className="container-main max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Leaf className="h-4 w-4" /> Om Minodling
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Vi älskar att odla.<br />
              <span className="text-green-300">Och vi vill att du ska det med.</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Minodling är Sveriges odlingscommunity – en digital mötesplats för alla som
              vill odla mer, lära sig mer och dela med sig mer.
            </p>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────── */}
        <section className="py-12 border-b border-gray-100">
          <div className="container-main">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-green-700 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VÅR HISTORIA ──────────────────────────────────── */}
        <section className="py-20">
          <div className="container-main max-w-3xl">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 bg-sage-50 text-sage-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-sage-200 mb-4">
                🌿 Vår historia
              </span>
              <h2 className="text-3xl font-bold text-gray-900">Hur det började</h2>
            </div>
            <div className="prose prose-gray prose-lg max-w-none">
              <p>
                Minodling grundades 2021 av en grupp odlingsentusiaster som saknade en bra
                svensk plattform för odlare. Vi ville ha ett ställe där man kunde hitta
                pålitliga guider på svenska, ställa frågor och träffa andra som delar samma
                passion för att få saker att växa.
              </p>
              <p>
                Det började litet – med ett forum, en handfull guider och en tanke om att
                bygga något för alla som gillar att sätta händerna i jorden. Idag är vi
                tusentals odlare som delar erfarenheter, tips och skördar i en öppen och
                välkomnande gemenskap.
              </p>
              <p>
                Vi har vuxit till att inkludera en kunskapsbank med hundratals växtguider,
                odlingskalender, forum, dagbok och numera även en butik med noggrant utvalda
                produkter för svenska odlare. Men hjärtat är fortfarande detsamma – en
                gemenskap för alla som odlar.
              </p>
            </div>
          </div>
        </section>

        {/* ── VÄRDERINGAR ───────────────────────────────────── */}
        <section className="py-20 bg-sage-50/50">
          <div className="container-main">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900">Vad vi tror på</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                Dessa värderingar guidar oss i allt vi gör.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                    <v.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VAD VI ERBJUDER ───────────────────────────────── */}
        <section className="py-20">
          <div className="container-main max-w-4xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900">Vad Minodling erbjuder</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
                  <BookOpen className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900">Kunskapsbank</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Hundratals växtguider, odlingstips och guider – allt på svenska, för svenska förhållanden.
                </p>
                <Link href="/kunskapsbank" className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline">
                  Utforska <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
                  <MessageCircle className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Community</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Forum, frågor & svar och grupper där du kan dela erfarenheter med andra odlare.
                </p>
                <Link href="/forum" className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline">
                  Till forumet <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900">Butik</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Frön, jord och tillbehör noggrant utvalda för svenska odlare. Snabb leverans.
                </p>
                <Link href="/butik" className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline">
                  Handla <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── TEAMET ────────────────────────────────────────── */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container-main max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">Bakom Minodling</h2>
            {TEAM.map((member) => (
              <div key={member.name} className="bg-sage-50 rounded-2xl p-8 border border-sage-100">
                <div className="text-5xl mb-4">{member.emoji}</div>
                <h3 className="font-bold text-gray-900 text-xl">{member.name}</h3>
                <p className="text-green-700 text-sm font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-br from-green-700 to-sage-800">
          <div className="container-main text-center max-w-2xl">
            <Sprout className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Bli en del av gemenskapen
            </h2>
            <p className="text-white/75 text-lg mb-8">
              Gå med och träffa tusentals svenska odlare. Det är gratis och alltid välkommet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/registrera"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors"
              >
                <Star className="h-4 w-4" />
                Skapa konto gratis
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/25 font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Kontakta oss
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
