import { Metadata } from "next";
import { getSettings, SETTINGS } from "@/lib/settings";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { BarChart3, Search, Globe, CheckCircle2, Bot, LayoutDashboard } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { saveAnalytics, saveSeo, saveSite, saveAiKeys, saveHomepage } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inställningar | Admin" };

// ── Fältkomponent ─────────────────────────────────────────────────

function Field({
  label, name, defaultValue, placeholder, type = "text", hint, textarea,
}: {
  label: string; name: string; defaultValue?: string | null;
  placeholder?: string; type?: string; hint?: string; textarea?: boolean;
}) {
  const base = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} rows={3} className={`${base} resize-y`} />
      ) : (
        <input type={type} name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={base} />
      )}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Sektionsrubrik ────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="h-9 w-9 rounded-xl bg-sage-50 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-sage-600" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ── Sida ──────────────────────────────────────────────────────────

export default async function InstallningarPage() {
  const [s, plantIdSetting, plantNetSetting, heroStatsSetting] = await Promise.all([
    getSettings(),
    prisma.adminSetting.findUnique({ where: { key: "plant_id_api_key" }, select: { value: true } }).catch(() => null),
    prisma.adminSetting.findUnique({ where: { key: "plantnet_api_key" }, select: { value: true } }).catch(() => null),
    prisma.adminSetting.findUnique({ where: { key: SETTINGS.HERO_STATS_VISIBLE }, select: { value: true } }).catch(() => null),
  ]);
  const heroStatsVisible = heroStatsSetting?.value !== "false";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inställningar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ändringar sparas direkt och träder i kraft inom 5 minuter.
        </p>
      </div>

      {/* ── Analytics ─────────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={BarChart3} title="Analytics" description="Tracking och webbanalys" />
        <SettingsSection action={saveAnalytics}>
          <Field label="Google Analytics Tracking ID" name={SETTINGS.GA_ID} defaultValue={s.gaId} placeholder="G-XXXXXXXXXX" hint="Mätnings-ID från Google Analytics 4. Lämna tom om du använder custom script." />
          <Field label="Custom Google Analytics Script" name={SETTINGS.GA_SCRIPT} defaultValue={s.gaScript} placeholder="window.dataLayer = window.dataLayer || []; ..." hint="Klistra in hela scriptet (utan <script>-taggar). Används istället för Tracking ID." textarea />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Google Search Console verifieringskod" name={SETTINGS.GOOGLE_VERIFICATION} defaultValue={s.googleVerification} placeholder="abc123xyz..." hint='Koden från meta-taggen: content="..."' />
            <Field label="Bing Webmaster Tools verifieringskod" name={SETTINGS.BING_VERIFICATION} defaultValue={s.bingVerification} placeholder="abc123xyz..." hint="Koden från msvalidate.01 meta-taggen" />
          </div>
        </SettingsSection>
      </Card>

      {/* ── SEO ──────────────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={Search} title="SEO" description="Standardvärden för sökmotoroptimering" />
        <SettingsSection action={saveSeo}>
          <Field label="Standard meta title" name={SETTINGS.SEO_TITLE} defaultValue={s.seoTitle} placeholder="Minodling – Sveriges odlingscommunity" />
          <Field label="Standard meta description" name={SETTINGS.SEO_DESCRIPTION} defaultValue={s.seoDescription} placeholder="Dela din trädgårdspassion..." textarea />
          <Field label="Standard Open Graph-bild (URL)" name={SETTINGS.SEO_OG_IMAGE} defaultValue={s.seoOgImage} placeholder="/og-image.jpg eller https://..." hint="Används som delningsbild på sociala medier. Rekommenderad storlek: 1200×630 px." />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Canonical bas-URL" name={SETTINGS.SEO_CANONICAL} defaultValue={s.seoCanonical} placeholder="https://minodling.se" hint="Utan avslutande snedstreck" />
            <Field label="Robots-direktiv" name={SETTINGS.SEO_ROBOTS} defaultValue={s.seoRobots} placeholder="index, follow" hint="T.ex. index, follow — eller noindex för hela sajten" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input type="checkbox" id="sitemap" name={SETTINGS.SEO_SITEMAP} value="true" defaultChecked={s.seoSitemapEnabled} className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500" />
            <label htmlFor="sitemap" className="text-sm text-gray-700">
              Aktivera sitemap (<span className="font-mono text-xs">/sitemap.xml</span>)
            </label>
          </div>
        </SettingsSection>
      </Card>

      {/* ── Sajt-inställningar ────────────────────────────────── */}
      <Card>
        <SectionHeader icon={Globe} title="Sajt-inställningar" description="Generell information och utseende" />
        <SettingsSection action={saveSite}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Sajtnamn" name={SETTINGS.SITE_NAME} defaultValue={s.siteName} placeholder="Minodling" />
            <Field label="Kontaktmail" name={SETTINGS.SITE_EMAIL} defaultValue={s.contactEmail} placeholder="hej@minodling.se" type="email" />
          </div>
          <Field label="Footer-text" name={SETTINGS.SITE_FOOTER} defaultValue={s.footerText} placeholder="Byggt med kärlek för svenska odlare 🌱" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Sociala medier</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Instagram" name={SETTINGS.SITE_INSTAGRAM} defaultValue={s.instagram} placeholder="https://instagram.com/minodling" />
              <Field label="Facebook"  name={SETTINGS.SITE_FACEBOOK}  defaultValue={s.facebook}  placeholder="https://facebook.com/minodling" />
              <Field label="Twitter / X" name={SETTINGS.SITE_TWITTER} defaultValue={s.twitter}   placeholder="https://twitter.com/minodling" />
            </div>
          </div>
          <Field label="Cookie-bannertext" name={SETTINGS.SITE_COOKIE_TEXT} defaultValue={s.cookieText} placeholder="Vi använder cookies för att förbättra din upplevelse." textarea />
        </SettingsSection>
      </Card>

      {/* ── AI / Växt-API-nycklar ─────────────────────────────── */}
      <Card>
        <SectionHeader icon={Bot} title="AI-växtanalys" description="API-nycklar för Identifiera växt och Växtdiagnos" />
        <SettingsSection action={saveAiKeys}>
          <Field label="Plant.id API-nyckel" name="plant_id_api_key" defaultValue={plantIdSetting?.value ?? ""} placeholder="Klistra in din Plant.id API-nyckel" type="password" hint="Används för växtidentifiering och Health Assessment-diagnos. Plant.id har prioritet om båda är ifyllda." />
          <Field label="PlantNet API-nyckel" name="plantnet_api_key" defaultValue={plantNetSetting?.value ?? ""} placeholder="Klistra in din PlantNet API-nyckel" type="password" hint="Alternativ till Plant.id – används om Plant.id-nyckeln saknas. Stöder enbart identifiering, inte diagnos." />
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Hur det fungerar</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>Plant.id</strong> — identifiering + diagnos. Registrera på <a href="https://plant.id" target="_blank" rel="noopener" className="underline">plant.id</a></li>
              <li><strong>PlantNet</strong> — enbart identifiering. Registrera på <a href="https://my.plantnet.org" target="_blank" rel="noopener" className="underline">my.plantnet.org</a></li>
              <li>Utan nyckel körs <strong>demoläge</strong> med simulerade svar</li>
            </ul>
          </div>
        </SettingsSection>
      </Card>

      {/* ── Startsida ─────────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={LayoutDashboard} title="Startsida" description="Styr vad som visas på startsidan" />
        <SettingsSection action={saveHomepage}>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id={SETTINGS.HERO_STATS_VISIBLE}
              name={SETTINGS.HERO_STATS_VISIBLE}
              defaultChecked={heroStatsVisible}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
            />
            <div>
              <label htmlFor={SETTINGS.HERO_STATS_VISIBLE} className="text-sm font-medium text-gray-700 cursor-pointer">
                Visa statistik i hero
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Visar antal växter, aktiva odlare och guider under hero-texten på startsidan.
              </p>
            </div>
          </div>
        </SettingsSection>
      </Card>

      {/* ── Status-info ───────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
        <p className="text-sm text-green-700">
          Inställningar cachas i 5 minuter. Använd{" "}
          <span className="font-mono text-xs bg-green-100 px-1 rounded">/sitemap.xml</span> och{" "}
          <span className="font-mono text-xs bg-green-100 px-1 rounded">/robots.txt</span>{" "}
          för att verifiera SEO-inställningarna.
        </p>
      </div>
    </div>
  );
}
