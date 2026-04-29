/**
 * JURIDISK NOTERING:
 * Denna integritetspolicy är ett utkast och bör granskas av en juridisk rådgivare
 * eller dataskyddsombud innan webbplatsen lanseras publikt.
 * Säkerställ att texten stämmer med hur personuppgifter faktiskt behandlas
 * i er verksamhet samt att den uppfyller aktuella GDPR-krav.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { canonicalUrl, baseOg } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const url = canonicalUrl(settings, "/integritetspolicy");
  return {
    title: "Integritetspolicy – Minodling",
    description:
      "Läs om hur Minodling samlar in, använder och skyddar dina personuppgifter i enlighet med GDPR.",
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      title: "Integritetspolicy – Minodling",
      description: "Hur vi hanterar dina personuppgifter på Minodling.",
      url,
    },
  };
}

const UPDATED = "29 april 2026";

export default async function IntegritetspolicyPage() {
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
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Integritetspolicy</h1>
            </div>
            <p className="text-gray-500">
              Senast uppdaterad: {UPDATED}
            </p>
          </div>
        </div>

        <article className="container-main max-w-3xl py-12 prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline">

          <p className="lead text-lg text-gray-600 not-prose mb-8">
            Vi på Minodling värnar om din integritet. Denna policy förklarar vilka personuppgifter
            vi samlar in, varför vi gör det och hur du kan utöva dina rättigheter enligt GDPR
            (dataskyddsförordningen).
          </p>

          <h2>1. Vem är ansvarig för dina uppgifter?</h2>
          <p>
            Personuppgiftsansvarig är Minodling (<strong>minodling.se</strong>). Har du frågor om
            hur vi hanterar dina uppgifter, kontakta oss på{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>

          <h2>2. Vilka personuppgifter samlar vi in?</h2>

          <h3>Kontouppgifter</h3>
          <ul>
            <li><strong>Namn och användarnamn</strong> – det namn du väljer vid registrering.</li>
            <li><strong>E-postadress</strong> – för inloggning och kommunikation.</li>
            <li><strong>Profilbild</strong> – om du väljer att ladda upp en.</li>
            <li><strong>Plats och odlingszon</strong> – valfritt, för att anpassa innehåll.</li>
            <li><strong>Erfarenhetsnivå och odlingstyp</strong> – valfritt profilinformation.</li>
          </ul>

          <h3>Innehåll du skapar</h3>
          <ul>
            <li>Inlägg, kommentarer och svar i forumet.</li>
            <li>Bilder du laddar upp (profilbild, inlägg, odlingsdagbok, växtdiagnos m.m.).</li>
            <li>Odlingsdagbok, påminnelser och kalenderuppgifter.</li>
            <li>Fröbyte- och plantbyteserbjudanden.</li>
            <li>Bidrag till utmaningar och odlingsgrupper.</li>
          </ul>

          <h3>Teknisk data</h3>
          <ul>
            <li><strong>IP-adress</strong> – för säkerhet och felavhjälpning.</li>
            <li><strong>Cookies</strong> – se vår <Link href="/cookies">cookiepolicy</Link>.</li>
            <li><strong>Statistikdata</strong> – besöksstatistik via Google Analytics (kräver ditt samtycke).</li>
            <li><strong>Enhets- och webbläsardata</strong> – för teknisk felsökning.</li>
          </ul>

          <h2>3. Varför samlar vi in dina uppgifter?</h2>

          <div className="not-prose overflow-hidden rounded-xl border border-gray-100 mb-8">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Ändamål</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Rättslig grund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Skapa och hantera ditt konto",             "Avtal (fullgörande av tjänsten)"],
                  ["Tillhandahålla communityfunktioner",       "Avtal"],
                  ["Skicka viktiga meddelanden om tjänsten",   "Berättigat intresse"],
                  ["Säkerhet och förhindra missbruk",          "Berättigat intresse"],
                  ["Besöksstatistik och analys",               "Samtycke"],
                  ["Förbättra och utveckla tjänsten",          "Berättigat intresse"],
                  ["Uppfylla lagkrav",                         "Rättslig förpliktelse"],
                ].map(([syfte, grund]) => (
                  <tr key={syfte} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-700">{syfte}</td>
                    <td className="px-4 py-3 text-gray-500">{grund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>4. Hur länge sparar vi dina uppgifter?</h2>
          <ul>
            <li><strong>Kontouppgifter</strong> – så länge ditt konto är aktivt.</li>
            <li><strong>Innehåll</strong> – tills du raderar det eller ditt konto.</li>
            <li><strong>Teknisk loggdata</strong> – normalt 30–90 dagar.</li>
            <li><strong>Statistik</strong> – aggregerad och avidentifierad data kan sparas längre.</li>
          </ul>

          <h2>5. Vem delar vi dina uppgifter med?</h2>
          <p>
            Vi säljer aldrig dina personuppgifter. Vi kan dela data med:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> – vår databas- och autentiseringsleverantör (EU-baserat).
            </li>
            <li>
              <strong>Vercel</strong> – vår hostingleverantör (servrar i EU möjliga).
            </li>
            <li>
              <strong>Google Analytics</strong> – om du godkänt statistikcookies.
            </li>
            <li>
              <strong>Myndigheter</strong> – om vi är skyldiga enligt lag.
            </li>
          </ul>
          <p>
            Alla leverantörer behandlar uppgifter enligt gällande dataskyddslagstiftning och med
            lämpliga skyddsåtgärder (standardavtalsklausuler vid överföring utanför EU/EES).
          </p>

          <h2>6. Hur skyddar vi dina uppgifter?</h2>
          <ul>
            <li>All kommunikation sker krypterat via HTTPS/TLS.</li>
            <li>Lösenord lagras aldrig i klartext – autentisering hanteras av Supabase Auth.</li>
            <li>Tillgång till produktionsdatabasen är begränsad till behöriga medarbetare.</li>
            <li>Vi genomför regelbundna uppdateringar av beroenden och säkerhetspatcher.</li>
          </ul>

          <h2>7. Dina rättigheter enligt GDPR</h2>
          <p>
            Du har rätt att:
          </p>
          <ul>
            <li>
              <strong>Begära tillgång (utdrag)</strong> – få en kopia av de uppgifter vi har om dig.
            </li>
            <li>
              <strong>Begära rättelse</strong> – korrigera felaktiga eller ofullständiga uppgifter.
            </li>
            <li>
              <strong>Begära radering</strong> – &ldquo;rätten att bli glömd&rdquo;, med de begränsningar
              som lagen anger.
            </li>
            <li>
              <strong>Begära begränsning</strong> – begränsa hur vi behandlar dina uppgifter under
              en prövning.
            </li>
            <li>
              <strong>Invända mot behandling</strong> – exempelvis mot behandling grundad på
              berättigat intresse.
            </li>
            <li>
              <strong>Dataportabilitet</strong> – få ut dina uppgifter i ett strukturerat,
              maskinläsbart format.
            </li>
            <li>
              <strong>Återkalla samtycke</strong> – närsomhelst, utan att det påverkar lagligheten
              av tidigare behandling.
            </li>
          </ul>
          <p>
            Kontakta oss på <a href={`mailto:${email}`}>{email}</a> för att utöva dina rättigheter.
            Vi svarar inom 30 dagar. Du har också rätt att lämna klagomål till{" "}
            <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">
              Integritetsskyddsmyndigheten (IMY)
            </a>.
          </p>

          <h2>8. Cookies</h2>
          <p>
            Vi använder cookies för att tjänsten ska fungera och för statistik. Läs mer i vår{" "}
            <Link href="/cookies">cookiepolicy</Link>.
          </p>

          <h2>9. Ändringar av denna policy</h2>
          <p>
            Vi kan uppdatera denna policy vid behov. Vid väsentliga ändringar meddelar vi dig
            via e-post eller tydlig notis på webbplatsen. Det senaste datumet för uppdatering
            framgår alltid överst på denna sida.
          </p>

          <h2>10. Kontakt</h2>
          <p>
            Har du frågor om vår integritetspolicy eller hur vi hanterar dina uppgifter?
            Kontakta oss på <a href={`mailto:${email}`}>{email}</a>.
          </p>

          <div className="not-prose mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/anvandarvillkor" className="hover:text-gray-600 transition-colors">Användarvillkor</Link>
            <Link href="/cookies" className="hover:text-gray-600 transition-colors">Cookiepolicy</Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
