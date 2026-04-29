/**
 * JURIDISK NOTERING:
 * Denna cookiepolicy är ett utkast och bör granskas av en juridisk rådgivare
 * innan webbplatsen lanseras publikt. Säkerställ att listan på cookies stämmer
 * med de cookies som faktiskt används och att samtyckesfunktionen (cookie banner)
 * är korrekt implementerad enligt lagen om elektronisk kommunikation och GDPR.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { canonicalUrl, baseOg } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const url = canonicalUrl(settings, "/cookies");
  return {
    title: "Cookiepolicy – Minodling",
    description:
      "Läs om hur Minodling använder cookies och hur du hanterar dina cookieinställningar.",
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      title: "Cookiepolicy – Minodling",
      description: "Information om cookies på Minodling.",
      url,
    },
  };
}

const UPDATED = "29 april 2026";

interface CookieRow {
  name:     string;
  provider: string;
  purpose:  string;
  duration: string;
}

const NECESSARY_COOKIES: CookieRow[] = [
  { name: "sb-*",             provider: "Supabase",  purpose: "Autentisering och session – krävs för inloggning.",          duration: "Session / 1 år" },
  { name: "__vercel_live_*",  provider: "Vercel",    purpose: "Driftsövervakning för hosting-plattformen.",                  duration: "Session" },
  { name: "cookie_consent",   provider: "Minodling", purpose: "Sparar ditt samtyckesbeslut för cookies.",                   duration: "1 år" },
];

const ANALYTICS_COOKIES: CookieRow[] = [
  { name: "_ga",       provider: "Google Analytics", purpose: "Identifierar unika besökare för statistikändamål.",          duration: "2 år" },
  { name: "_ga_*",     provider: "Google Analytics", purpose: "Lagrar sessionstillstånd för Google Analytics 4.",           duration: "2 år" },
  { name: "_gid",      provider: "Google Analytics", purpose: "Registrerar unikt besökar-ID för 24 timmar.",               duration: "24 timmar" },
  { name: "_gat",      provider: "Google Analytics", purpose: "Används för att begränsa antalet förfrågningar till GA.",    duration: "1 minut" },
];

const FUNCTIONAL_COOKIES: CookieRow[] = [
  { name: "theme",  provider: "Minodling", purpose: "Sparar ditt val av ljust/mörkt tema (om tillämpligt).",              duration: "1 år" },
  { name: "locale", provider: "Minodling", purpose: "Sparar ditt språkval.",                                              duration: "1 år" },
];

const MARKETING_COOKIES: CookieRow[] = [
  { name: "_uetsid / _uetvid", provider: "Microsoft (Bing)", purpose: "Spårning för Bing Ads och Microsoft Clarity.", duration: "Session / 13 månader" },
];

function CookieTable({ cookies }: { cookies: CookieRow[] }) {
  return (
    <div className="not-prose overflow-x-auto rounded-xl border border-gray-100 mb-8">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Cookie", "Leverantör", "Syfte", "Giltighetstid"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cookies.map((c) => (
            <tr key={c.name} className="hover:bg-gray-50/50">
              <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{c.name}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.provider}</td>
              <td className="px-4 py-3 text-gray-600">{c.purpose}</td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CookiesPage() {
  const settings = await getSettings();
  const email    = settings.contactEmail;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={null} />
      <main className="flex-1 bg-white">

        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-b border-gray-100 py-12">
          <div className="container-main max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Cookie className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Cookiepolicy</h1>
            </div>
            <p className="text-gray-500">Senast uppdaterad: {UPDATED}</p>
          </div>
        </div>

        <article className="container-main max-w-3xl py-12 prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline">

          <p className="lead text-lg text-gray-600 not-prose mb-8">
            Den här sidan förklarar vad cookies är, vilka vi använder och hur du styr dina
            inställningar. Vår ambition är full transparens.
          </p>

          <h2>1. Vad är cookies?</h2>
          <p>
            Cookies är små textfiler som lagras i din webbläsare när du besöker en webbplats.
            De används för att komma ihåg dig, hålla dig inloggad och samla in statistik.
            Cookies kan vara <strong>sessionscookies</strong> (försvinner när du stänger
            webbläsaren) eller <strong>permanenta cookies</strong> (lagras under en bestämd tid).
          </p>
          <p>
            Cookies kan sättas av oss (<em>förstapartscookies</em>) eller av tredjepartstjänster
            vi använder (<em>tredjepartscookies</em>).
          </p>

          <h2>2. Vilka cookies använder vi?</h2>

          <h3>🔒 Nödvändiga cookies</h3>
          <p>
            Dessa cookies är nödvändiga för att tjänsten ska fungera. Du kan inte stänga av
            dem utan att tjänsten slutar fungera korrekt. De kräver inget samtycke.
          </p>
          <CookieTable cookies={NECESSARY_COOKIES} />

          <h3>📊 Statistikcookies</h3>
          <p>
            Statistikcookies hjälper oss förstå hur besökare använder sajten. Vi använder
            <strong> Google Analytics</strong> – men dessa cookies aktiveras <strong>endast</strong>{" "}
            om du har godkänt dem i vår cookie-banner. All data behandlas anonymiserat
            (IP-adresser anonymiseras).
          </p>
          <CookieTable cookies={ANALYTICS_COOKIES} />

          <h3>⚙️ Funktionscookies</h3>
          <p>
            Funktionscookies gör det möjligt att komma ihåg dina preferenser och anpassa
            upplevelsen. De aktiveras om du godkänner dem.
          </p>
          <CookieTable cookies={FUNCTIONAL_COOKIES} />

          <h3>📣 Marknadsföringscookies</h3>
          <p>
            Marknadsföringscookies används för att mäta effektiviteten av annonser.
            Vi använder <strong>Microsoft (Bing)</strong>-skript{" "}
            <strong>endast om du aktivt godkänt marknadsföringscookies</strong> i cookie-bannern.
            Vi kör för närvarande inga aktiva annonskampanjer, men tekniken är förberedd.
          </p>
          <CookieTable cookies={MARKETING_COOKIES} />

          <h2>3. Samtyckeshantering</h2>
          <p>
            Vid ditt första besök visas en cookie-banner där du väljer vilka kategorier du
            godkänner. Nödvändiga cookies kan inte avaktiveras. Ditt val sparas i en cookie
            (<code>cookie_consent</code>) i ett år.
          </p>

          <div className="not-prose bg-green-50 border border-green-100 rounded-xl p-5 mb-6">
            <p className="text-sm font-semibold text-green-800 mb-2">Ändra dina inställningar</p>
            <p className="text-sm text-green-700">
              Du kan när som helst ändra dina cookie-inställningar via knappen nedan eller
              i din webbläsares inställningar.
            </p>
            <button
              className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              onClick={undefined}
              id="open-cookie-settings"
              aria-label="Öppna cookieinställningar">
              Hantera cookieinställningar
            </button>
          </div>

          <h2>4. Hur du hanterar cookies i webbläsaren</h2>
          <p>
            Du kan blockera eller ta bort cookies direkt i din webbläsare. Observera att detta
            kan påverka funktionaliteten på Minodling och andra webbplatser.
          </p>
          <ul>
            <li>
              <strong>Chrome:</strong>{" "}
              Inställningar → Sekretess och säkerhet → Cookies och webbplatsdata
            </li>
            <li>
              <strong>Firefox:</strong>{" "}
              Inställningar → Sekretess och säkerhet → Cookies och webbplatsdata
            </li>
            <li>
              <strong>Safari:</strong>{" "}
              Inställningar → Safari → Integritet → Hantera webbplatsdata
            </li>
            <li>
              <strong>Edge:</strong>{" "}
              Inställningar → Sekretess, sökning och tjänster → Cookies
            </li>
          </ul>
          <p>
            Du kan också välja bort Google Analytics-spårning globalt via{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Googles opt-out-tillägg
            </a>.
          </p>

          <h2>5. Tredjepartsleverantörers policyer</h2>
          <ul>
            <li>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Googles integritetspolicy
              </a>
            </li>
            <li>
              <a href="https://privacy.microsoft.com/sv-se/privacystatement" target="_blank" rel="noopener noreferrer">
                Microsofts sekretesspolicy
              </a>
            </li>
            <li>
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                Supabase integritetspolicy
              </a>
            </li>
          </ul>

          <h2>6. Ändringar av cookiepolicyn</h2>
          <p>
            Vi kan uppdatera denna policy när vi lägger till eller tar bort tjänster.
            Senaste uppdateringsdatum visas alltid överst på sidan.
          </p>

          <h2>7. Kontakt</h2>
          <p>
            Frågor om vår cookieanvändning? Hör av dig till{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>

          <div className="not-prose mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/integritetspolicy" className="hover:text-gray-600 transition-colors">Integritetspolicy</Link>
            <Link href="/anvandarvillkor" className="hover:text-gray-600 transition-colors">Användarvillkor</Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
