/**
 * JURIDISK NOTERING:
 * Dessa användarvillkor är ett utkast och bör granskas av en juridisk rådgivare
 * innan webbplatsen lanseras publikt. Säkerställ att villkoren stämmer med
 * tillämplig lagstiftning (konsumenträtt, e-handelslagen m.m.) och er faktiska
 * verksamhet, inklusive framtida marketplace- och premiumfunktioner.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { canonicalUrl, baseOg } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const url = canonicalUrl(settings, "/anvandarvillkor");
  return {
    title: "Användarvillkor – Minodling",
    description:
      "Läs Minodlings användarvillkor. Regler för hur du får använda plattformen, community-normer och ansvarsförhållanden.",
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      title: "Användarvillkor – Minodling",
      description: "Regler och villkor för användning av Minodling.",
      url,
    },
  };
}

const UPDATED = "29 april 2026";

export default async function AnvandarvillkorPage() {
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
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Användarvillkor</h1>
            </div>
            <p className="text-gray-500">Senast uppdaterad: {UPDATED}</p>
          </div>
        </div>

        <article className="container-main max-w-3xl py-12 prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline">

          <p className="lead text-lg text-gray-600 not-prose mb-8">
            Välkommen till Minodling! Genom att skapa ett konto eller använda tjänsten godkänner
            du dessa villkor. Läs dem noggrant – de styr förhållandet mellan dig och Minodling.
          </p>

          <h2>1. Om tjänsten</h2>
          <p>
            Minodling (<strong>minodling.se</strong>) är en community-plattform för odlingsintresserade.
            Tjänsten erbjuder forum, odlingsdagbok, fröbyte, utmaningar, guider och andra
            communityfunktioner. Vissa funktioner kan kräva ett registrerat konto.
          </p>

          <h2>2. Krav för användning</h2>
          <ul>
            <li>Du måste vara minst 13 år för att skapa ett konto.</li>
            <li>Du ansvarar för att uppgifterna du anger vid registrering är korrekta.</li>
            <li>Du ansvarar för att hålla ditt lösenord hemligt och skydda ditt konto.</li>
            <li>Ett konto är personligt och får inte överlåtas till annan person.</li>
          </ul>

          <h2>3. Regler för innehåll och uppförande</h2>

          <h3>3.1 Du ansvarar för ditt innehåll</h3>
          <p>
            Allt du publicerar på Minodling – inlägg, kommentarer, bilder, fröbytesannonser m.m. –
            är ditt eget ansvar. Du garanterar att du har rätt att publicera innehållet och att det
            inte bryter mot gällande lagstiftning eller dessa villkor.
          </p>

          <h3>3.2 Förbjudet innehåll och beteende</h3>
          <p>Det är <strong>inte tillåtet</strong> att:</p>
          <ul>
            <li>Publicera olagligt, kränkande, diskriminerande eller stötande innehåll.</li>
            <li>Trakassera, hota eller mobbla andra användare.</li>
            <li>Skicka spam, massmeddelanden eller oönskad reklam.</li>
            <li>Sprida vilseledande, falsk eller bedräglig information.</li>
            <li>Bryta mot upphovsrätt – publicera material du inte äger rättigheterna till.</li>
            <li>Marknadsföra produkter eller tjänster utan Minodlings tillåtelse.</li>
            <li>Försöka hacka, manipulera eller störa tjänstens funktion.</li>
            <li>Skapa falska konton eller utge sig för att vara någon annan.</li>
            <li>Sälja eller förmedla förbjudna växter, frön eller substanser.</li>
          </ul>

          <h2>4. Moderering och åtgärder</h2>
          <p>
            Minodling förbehåller sig rätten att:
          </p>
          <ul>
            <li>Granska och moderera innehåll som rapporterats av användare.</li>
            <li>Ta bort innehåll som bryter mot dessa villkor eller är olämpligt.</li>
            <li>Varna, tillfälligt stänga av eller permanent bannlysa användare som bryter mot villkoren.</li>
            <li>Begränsa åtkomst till delar av tjänsten vid behov.</li>
          </ul>
          <p>
            Vi strävar alltid efter att agera proportionerligt och rättvist. Vid allvarliga
            överträdelser (t.ex. olagligt innehåll) kan vi vara skyldiga att anmäla till myndigheter.
          </p>

          <h2>5. Community-regler</h2>
          <p>
            Minodling är en inkluderande och vänlig gemenskap. Vi förväntar oss att alla:
          </p>
          <ul>
            <li>Bemöter varandra med respekt och välvilja.</li>
            <li>Delar kunskap generöst och konstruktivt.</li>
            <li>Håller diskussioner relevanta för odling och natur.</li>
            <li>Rapporterar innehåll som bryter mot reglerna via rapporteringsknappen.</li>
          </ul>

          <h2>6. Fröbyte och plantbyte</h2>
          <p>
            Fröbyte-funktionen är avsedd för utbyte av frön, plantor, sticklingar och
            trädgårdsrelaterat material mellan privatpersoner.
          </p>
          <ul>
            <li>
              Minodling är inte part i affärer eller byten mellan användare och ansvarar inte
              för utbytenas genomförande, kvalitet eller eventuella tvister.
            </li>
            <li>
              Det är förbjudet att förmedla invasiva arter, narkotikaklassade växter eller
              annat reglerat material.
            </li>
            <li>Prissatta annonser ska följa konsumentlagstiftningen om du säljer kommersiellt.</li>
            <li>Säljaren ansvarar för att följa tillämpliga regler för frö- och växthandel.</li>
          </ul>

          <h2>7. Marketplace (framtida funktion)</h2>
          <p>
            Minodling planerar att lansera en marketplace för köp och försäljning av
            trädgårdsrelaterade produkter. Specifika villkor för denna funktion kommer att
            publiceras separat i samband med lansering. Dessa allmänna villkor gäller
            tills dess som komplement.
          </p>

          <h2>8. Immateriella rättigheter</h2>
          <p>
            Du behåller äganderätten till innehåll du publicerar. Genom att publicera
            innehåll på Minodling ger du oss en icke-exklusiv, global, royaltyfri licens
            att visa, distribuera och marknadsföra ditt innehåll inom ramen för tjänsten.
            Du kan när som helst ta bort ditt innehåll.
          </p>
          <p>
            Minodlings varumärke, logotyp, design och kod är skyddade och får inte användas
            utan skriftligt tillstånd.
          </p>

          <h2>9. Ansvarsfriskrivning</h2>

          <div className="not-prose bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Odlingsråd och information:</strong> Allt odlingsinnehåll på Minodling –
              inklusive guider, forumsvar, kalenderuppgifter och odlingstips – är allmän
              information och ska inte betraktas som professionell rådgivning. Resultat kan
              variera beroende på klimat, odlingsplats, sort och andra faktorer. Minodling
              ansvarar inte för skador på grödor, trädgård eller egendom till följd av råd
              eller information på plattformen.
            </p>
          </div>

          <ul>
            <li>
              Tjänsten tillhandahålls &ldquo;i befintligt skick&rdquo;. Vi garanterar inte att
              tjänsten är felfri eller alltid tillgänglig.
            </li>
            <li>
              Minodling ansvarar inte för innehåll publicerat av användare.
            </li>
            <li>
              Minodling ansvarar inte för affärer, byten eller kommunikation mellan användare.
            </li>
            <li>
              Indirekt skada, utebliven vinst eller datförlust ersätts inte.
            </li>
          </ul>

          <h2>10. Ändringar av villkoren</h2>
          <p>
            Vi kan uppdatera dessa villkor. Vid väsentliga ändringar meddelar vi dig via
            e-post eller tydlig notis i tjänsten minst 14 dagar i förväg. Fortsatt användning
            av tjänsten efter ikraftträdandedatumet innebär att du godkänner de nya villkoren.
          </p>

          <h2>11. Tillämplig lag</h2>
          <p>
            Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand
            lösas genom dialog. I andra hand kan tvisten hänskjutas till Allmänna
            reklamationsnämnden (ARN) eller allmän domstol i Sverige.
          </p>

          <h2>12. Kontakt</h2>
          <p>
            Frågor om dessa villkor? Kontakta oss på{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>

          <div className="not-prose mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/integritetspolicy" className="hover:text-gray-600 transition-colors">Integritetspolicy</Link>
            <Link href="/cookies" className="hover:text-gray-600 transition-colors">Cookiepolicy</Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
