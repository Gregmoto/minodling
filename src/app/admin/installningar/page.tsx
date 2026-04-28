import { Metadata } from "next";
import { getSettings, SETTINGS } from "@/lib/settings";
import { updateSettingsBulk } from "@/app/admin/actions";
import { Card } from "@/components/ui/Card";
import {
  BarChart3, Search, Globe, CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inställningar | Admin" };

// ── Fältkomponent ────────────────────────────────────────────────
function Field({
  label, name, defaultValue, placeholder, type = "text", hint, textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  type?: string;
  hint?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          rows={3}
          className={`${base} resize-y`}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className={base}
        />
      )}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Sektionsrubrik ───────────────────────────────────────────────
function SectionHeader({
  icon: Icon, title, description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
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

// ── Spara-knapp ──────────────────────────────────────────────────
function SaveButton() {
  return (
    <div className="flex justify-end pt-4 border-t border-gray-100">
      <button
        type="submit"
        className="px-5 py-2 text-sm font-medium bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
      >
        Spara ändringar
      </button>
    </div>
  );
}

// ── Sida ─────────────────────────────────────────────────────────
export default async function InstallningarPage() {
  const s = await getSettings();

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
        <SectionHeader
          icon={BarChart3}
          title="Analytics"
          description="Tracking och webbanalys"
        />
        <form
          action={async (fd: FormData) => {
            "use server";
            await updateSettingsBulk({
              [SETTINGS.GA_ID]:               fd.get(SETTINGS.GA_ID) as string,
              [SETTINGS.GA_SCRIPT]:           fd.get(SETTINGS.GA_SCRIPT) as string,
              [SETTINGS.GOOGLE_VERIFICATION]: fd.get(SETTINGS.GOOGLE_VERIFICATION) as string,
              [SETTINGS.BING_VERIFICATION]:   fd.get(SETTINGS.BING_VERIFICATION) as string,
            });
          }}
          className="space-y-4"
        >
          <Field
            label="Google Analytics Tracking ID"
            name={SETTINGS.GA_ID}
            defaultValue={s.gaId}
            placeholder="G-XXXXXXXXXX"
            hint="Mätnings-ID från Google Analytics 4. Lämna tom om du använder custom script."
          />
          <Field
            label="Custom Google Analytics Script"
            name={SETTINGS.GA_SCRIPT}
            defaultValue={s.gaScript}
            placeholder="window.dataLayer = window.dataLayer || []; ..."
            hint="Klistra in hela scriptet (utan <script>-taggar). Används istället för Tracking ID."
            textarea
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Google Search Console verifieringskod"
              name={SETTINGS.GOOGLE_VERIFICATION}
              defaultValue={s.googleVerification}
              placeholder="abc123xyz..."
              hint='Koden från meta-taggen: content="..."'
            />
            <Field
              label="Bing Webmaster Tools verifieringskod"
              name={SETTINGS.BING_VERIFICATION}
              defaultValue={s.bingVerification}
              placeholder="abc123xyz..."
              hint='Koden från msvalidate.01 meta-taggen'
            />
          </div>
          <SaveButton />
        </form>
      </Card>

      {/* ── SEO ──────────────────────────────────────────────── */}
      <Card>
        <SectionHeader
          icon={Search}
          title="SEO"
          description="Standardvärden för sökmotoroptimering"
        />
        <form
          action={async (fd: FormData) => {
            "use server";
            await updateSettingsBulk({
              [SETTINGS.SEO_TITLE]:       fd.get(SETTINGS.SEO_TITLE) as string,
              [SETTINGS.SEO_DESCRIPTION]: fd.get(SETTINGS.SEO_DESCRIPTION) as string,
              [SETTINGS.SEO_OG_IMAGE]:    fd.get(SETTINGS.SEO_OG_IMAGE) as string,
              [SETTINGS.SEO_ROBOTS]:      fd.get(SETTINGS.SEO_ROBOTS) as string,
              [SETTINGS.SEO_SITEMAP]:     fd.get(SETTINGS.SEO_SITEMAP) as string,
              [SETTINGS.SEO_CANONICAL]:   fd.get(SETTINGS.SEO_CANONICAL) as string,
            });
          }}
          className="space-y-4"
        >
          <Field
            label="Standard meta title"
            name={SETTINGS.SEO_TITLE}
            defaultValue={s.seoTitle}
            placeholder="Minodling – Sveriges odlingscommunity"
          />
          <Field
            label="Standard meta description"
            name={SETTINGS.SEO_DESCRIPTION}
            defaultValue={s.seoDescription}
            placeholder="Dela din trädgårdspassion..."
            textarea
          />
          <Field
            label="Standard Open Graph-bild (URL)"
            name={SETTINGS.SEO_OG_IMAGE}
            defaultValue={s.seoOgImage}
            placeholder="/og-image.jpg eller https://..."
            hint="Används som delningsbild på sociala medier. Rekommenderad storlek: 1200×630 px."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Canonical bas-URL"
              name={SETTINGS.SEO_CANONICAL}
              defaultValue={s.seoCanonical}
              placeholder="https://minodling.se"
              hint="Utan avslutande snedstreck"
            />
            <Field
              label="Robots-direktiv"
              name={SETTINGS.SEO_ROBOTS}
              defaultValue={s.seoRobots}
              placeholder="index, follow"
              hint="T.ex. index, follow — eller noindex för hela sajten"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="sitemap"
              name={SETTINGS.SEO_SITEMAP}
              value="true"
              defaultChecked={s.seoSitemapEnabled}
              className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
            />
            <label htmlFor="sitemap" className="text-sm text-gray-700">
              Aktivera sitemap (<span className="font-mono text-xs">/sitemap.xml</span>)
            </label>
          </div>
          <SaveButton />
        </form>
      </Card>

      {/* ── Sajt-inställningar ────────────────────────────────── */}
      <Card>
        <SectionHeader
          icon={Globe}
          title="Sajt-inställningar"
          description="Generell information och utseende"
        />
        <form
          action={async (fd: FormData) => {
            "use server";
            await updateSettingsBulk({
              [SETTINGS.SITE_NAME]:        fd.get(SETTINGS.SITE_NAME) as string,
              [SETTINGS.SITE_FOOTER]:      fd.get(SETTINGS.SITE_FOOTER) as string,
              [SETTINGS.SITE_EMAIL]:       fd.get(SETTINGS.SITE_EMAIL) as string,
              [SETTINGS.SITE_INSTAGRAM]:   fd.get(SETTINGS.SITE_INSTAGRAM) as string,
              [SETTINGS.SITE_FACEBOOK]:    fd.get(SETTINGS.SITE_FACEBOOK) as string,
              [SETTINGS.SITE_TWITTER]:     fd.get(SETTINGS.SITE_TWITTER) as string,
              [SETTINGS.SITE_COOKIE_TEXT]: fd.get(SETTINGS.SITE_COOKIE_TEXT) as string,
            });
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Sajtnamn"
              name={SETTINGS.SITE_NAME}
              defaultValue={s.siteName}
              placeholder="Minodling"
            />
            <Field
              label="Kontaktmail"
              name={SETTINGS.SITE_EMAIL}
              defaultValue={s.contactEmail}
              placeholder="hej@minodling.se"
              type="email"
            />
          </div>
          <Field
            label="Footer-text"
            name={SETTINGS.SITE_FOOTER}
            defaultValue={s.footerText}
            placeholder="Byggt med kärlek för svenska odlare 🌱"
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Sociala medier</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field
                label="Instagram"
                name={SETTINGS.SITE_INSTAGRAM}
                defaultValue={s.instagram}
                placeholder="https://instagram.com/minodling"
              />
              <Field
                label="Facebook"
                name={SETTINGS.SITE_FACEBOOK}
                defaultValue={s.facebook}
                placeholder="https://facebook.com/minodling"
              />
              <Field
                label="Twitter / X"
                name={SETTINGS.SITE_TWITTER}
                defaultValue={s.twitter}
                placeholder="https://twitter.com/minodling"
              />
            </div>
          </div>
          <Field
            label="Cookie-bannertext"
            name={SETTINGS.SITE_COOKIE_TEXT}
            defaultValue={s.cookieText}
            placeholder="Vi använder cookies för att förbättra din upplevelse."
            textarea
          />
          <SaveButton />
        </form>
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
