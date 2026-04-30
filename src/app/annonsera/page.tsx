import type { Metadata } from "next";
import { Megaphone, BarChart3, Users, Zap, Mail, Check } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { canonicalUrl, baseOg } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const url = canonicalUrl(settings, "/annonsera");
  return {
    title: "Annonsera på Minodling – Nå Sveriges odlare",
    description:
      "Annonsera på Minodling och nå tusentals passionerade svenska odlare. Vi erbjuder bannerannonser, sponsrat innehåll, nyhetsbrev och partnerskap.",
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      title: "Annonsera på Minodling – Nå Sveriges odlare",
      description:
        "Nå tusentals passionerade svenska odlare med riktad annonsering på Minodling.",
      url,
    },
  };
}

const AD_OPTIONS = [
  {
    icon: BarChart3,
    title: "Bannerannons",
    description:
      "Synlig bannersannons på utvalda sidor. Perfekt för fröbolag, trädgårdsbutiker och odlingsprodukter.",
    features: [
      "Placering på startsida och innehållssidor",
      "Olika format anpassade för desktop och mobil",
      "Länk direkt till din produkt eller kampanj",
      "Detaljerad statistik på visningar och klick",
    ],
  },
  {
    icon: Megaphone,
    title: "Sponsrat innehåll",
    description:
      "Vi skapar eller publicerar ditt innehåll som en guide eller artikel i vår kunskapsbank. Når rätt målgrupp organiskt.",
    features: [
      "Redaktionellt utformat för odlingsintresserade",
      "Permanent plats i kunskapsbanken",
      "SEO-optimerat för långsiktig synlighet",
      "Tydlig märkning som sponsrat innehåll",
    ],
  },
  {
    icon: Mail,
    title: "Nyhetsbrev",
    description:
      "Nå ut direkt i våra prenumeranters inkorg med relevant odlingsinnehåll.",
    features: [
      "Dedikerat utrymme i vårt odlingsnyhetsbrev",
      "Segmentering efter odlingsintresse",
      "Hög öppningsfrekvens tack vare engagerade prenumeranter",
      "Mätbar räckvidd och klickfrekvens",
    ],
  },
  {
    icon: Zap,
    title: "Partnerskap",
    description:
      "Långsiktigt samarbete med exponering på hela plattformen. Skräddarsytt efter dina behov.",
    features: [
      "Logotyp och omnämnande på hela sajten",
      "Exklusiv kategoriplacering",
      "Samarbete kring säsongsanpassat innehåll",
      "Prioriterat i våra sociala kanaler",
    ],
  },
];

const STATS = [
  { value: "10 000+", label: "Aktiva odlare" },
  { value: "50 000+", label: "Sidvisningar/månad" },
  { value: "Högt", label: "Engagemang i community" },
];

const WHY_POINTS = [
  "Nischad målgrupp av aktiva odlare med köpintresse",
  "Högt engagemang – odlare söker aktivt tips och produkter",
  "Relevanta köpbeslut kring frön, jord, verktyg och plantor",
  "Rikstäckande räckvidd men med lokalt och personligt engagemang",
  "Trovärdig miljö – användare litar på innehållet på Minodling",
  "Säsongsbetonat – nå målgruppen när köpintresset är som störst",
];

export default async function AnnonseraPage() {
  const settings = await getSettings();
  const contactEmail = "hej@minodling.se";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={null} />
      <main className="flex-1 bg-white">

        {/* Hero */}
        <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 py-20">
          <div className="container-main max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Annonsera på Minodling
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed">
              Nå tusentals passionerade svenska odlare som aktivt letar efter produkter,
              tips och inspiration för sin odling. En engagerad nischmålgrupp med
              tydliga köpbehov.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-green-50 border-b border-green-100 py-10">
          <div className="container-main max-w-4xl">
            <div className="grid grid-cols-3 gap-6 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-green-700 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ad options */}
        <section className="container-main max-w-5xl py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Annonseringsalternativ
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Vi erbjuder flera sätt att nå vår community. Välj det alternativ som
              passar dina mål och din budget – eller kombinera flera för maximal effekt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {AD_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.title}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{option.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why advertise */}
        <section className="bg-gray-50 border-y border-gray-100 py-16">
          <div className="container-main max-w-4xl">
            <div className="md:flex md:gap-12 items-start">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Varför annonsera på Minodling?
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Minodling är mötesplatsen för svenska odlare – från balkongsodlare
                  i storstaden till erfarna trädgårdsmästare på landet. Vår community
                  är aktiv, engagerad och redo att köpa produkter som förbättrar
                  deras odling.
                </p>
              </div>
              <div className="md:w-1/2">
                <ul className="space-y-3">
                  {WHY_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="container-main max-w-3xl py-16">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-5">
              <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Redo att nå Sveriges odlare?
            </h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
              Skicka ett mejl till oss så sätter vi ihop ett paket som passar dig
              och dina mål. Berätta gärna kort om ditt varumärke och vad du vill uppnå.
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block text-2xl font-semibold text-green-700 hover:text-green-800 underline underline-offset-4 transition-colors mb-6"
            >
              {contactEmail}
            </a>
            <p className="text-sm text-gray-400">
              Vi svarar inom 1–2 arbetsdagar
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
