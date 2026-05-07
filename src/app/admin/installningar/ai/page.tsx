import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { SETTINGS } from "@/lib/settings";
import { Card } from "@/components/ui/Card";
import { SettingsSection } from "../SettingsSection";
import { saveAiSettings } from "./actions";
import {
  Bot, Key, Power, AlertTriangle, BarChart3, FlaskConical,
} from "lucide-react";

export const dynamic   = "force-dynamic";
export const metadata: Metadata = { title: "AI-inställningar | Admin" };

// ── Hjälpkomponenter ──────────────────────────────────────────────

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

function Toggle({ label, name, defaultChecked, hint }: {
  label: string; name: string; defaultChecked: boolean; hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={name}
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
      />
      <div>
        <label htmlFor={name} className="text-sm font-medium text-gray-700 cursor-pointer">{label}</label>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

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

// ── Hämta nuvarande värden ────────────────────────────────────────

async function getAiAdminSettings() {
  const keys = [
    SETTINGS.AI_PROVIDER,
    SETTINGS.AI_PLANT_ID_KEY,
    SETTINGS.AI_PLANTNET_KEY,
    SETTINGS.AI_IDENTIFICATION_ON,
    SETTINGS.AI_DIAGNOSIS_ON,
    SETTINGS.AI_FREE_CHECKS_PER_MONTH,
    SETTINGS.AI_DISCLAIMER,
  ];

  const rows = await prisma.adminSetting.findMany({
    where: { key: { in: keys } },
  }).catch(() => []);

  const map: Record<string, string> = {};
  for (const r of rows) if (r.value) map[r.key] = r.value;

  return {
    provider:         map[SETTINGS.AI_PROVIDER]              ?? "auto",
    plantIdKey:       map[SETTINGS.AI_PLANT_ID_KEY]          ?? "",
    plantNetKey:      map[SETTINGS.AI_PLANTNET_KEY]          ?? "",
    identEnabled:     map[SETTINGS.AI_IDENTIFICATION_ON]     !== "false",
    diagEnabled:      map[SETTINGS.AI_DIAGNOSIS_ON]          !== "false",
    freeChecks:       map[SETTINGS.AI_FREE_CHECKS_PER_MONTH] ?? "3",
    disclaimer:       map[SETTINGS.AI_DISCLAIMER]            ?? "",
  };
}

async function getUsageStats() {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  try {
    const [ident, diag, total] = await Promise.all([
      prisma.aiUsage.aggregate({
        where: { featureType: "identification", month, year },
        _sum: { count: true },
      }),
      prisma.aiUsage.aggregate({
        where: { featureType: "diagnosis", month, year },
        _sum: { count: true },
      }),
      prisma.aiUsage.count({ where: { month, year } }),
    ]);
    return {
      identThisMonth: ident._sum.count ?? 0,
      diagThisMonth:  diag._sum.count  ?? 0,
      activeUsers:    total,
    };
  } catch {
    return { identThisMonth: 0, diagThisMonth: 0, activeUsers: 0 };
  }
}

// ── Sida ──────────────────────────────────────────────────────────

export default async function AiSettingsPage() {
  const [s, stats] = await Promise.all([
    getAiAdminSettings(),
    getUsageStats(),
  ]);

  const hasPlantId  = !!s.plantIdKey;
  const hasPlantNet = !!s.plantNetKey;
  const effectiveProvider = hasPlantId ? "plant.id" : hasPlantNet ? "plantnet" : "mock";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI-växtanalys</h1>
        <p className="text-sm text-gray-500 mt-1">
          Inställningar för växtidentifiering och växtdiagnos.
        </p>
      </div>

      {/* ── Status-rad ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Identifieringar",  value: stats.identThisMonth, sub: "denna månad" },
          { label: "Diagnoser",        value: stats.diagThisMonth,  sub: "denna månad" },
          { label: "Aktiva användare", value: stats.activeUsers,    sub: "med analyser" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Aktiv provider-status ─────────────────────────────────── */}
      <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
        effectiveProvider === "mock"
          ? "border-amber-200 bg-amber-50"
          : "border-green-200 bg-green-50"
      }`}>
        {effectiveProvider === "mock" ? (
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        ) : (
          <FlaskConical className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
        )}
        <div className="text-sm">
          <p className={`font-semibold ${effectiveProvider === "mock" ? "text-amber-800" : "text-green-800"}`}>
            {effectiveProvider === "mock"
              ? "Demoläge aktivt – inga riktiga API-nycklar"
              : `Aktiv provider: ${effectiveProvider === "plant.id" ? "Plant.id" : "PlantNet"}`}
          </p>
          <p className={`text-xs mt-0.5 ${effectiveProvider === "mock" ? "text-amber-700" : "text-green-700"}`}>
            {effectiveProvider === "mock"
              ? "Lägg till en API-nyckel nedan för att aktivera riktig AI-analys."
              : "Riktig AI-analys är aktiverad. Analyser debiteras per användning."}
          </p>
        </div>
      </div>

      {/* ── API-nycklar & provider ────────────────────────────────── */}
      <Card>
        <SectionHeader icon={Key} title="API-nycklar" description="Anslutning till AI-tjänster för växtanalys" />
        <SettingsSection action={saveAiSettings}>
          <div className="space-y-4">
            <Field
              label="Plant.id API-nyckel"
              name={SETTINGS.AI_PLANT_ID_KEY}
              defaultValue={s.plantIdKey}
              placeholder="Klistra in din Plant.id API-nyckel"
              type="password"
              hint="Stöder identifiering + diagnos. Prioriteras om båda nycklar är ifyllda."
            />
            <Field
              label="PlantNet API-nyckel"
              name={SETTINGS.AI_PLANTNET_KEY}
              defaultValue={s.plantNetKey}
              placeholder="Klistra in din PlantNet API-nyckel"
              type="password"
              hint="Stöder enbart identifiering. Används som fallback om Plant.id-nyckeln saknas."
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Välj provider
              </label>
              <select
                name={SETTINGS.AI_PROVIDER}
                defaultValue={s.provider}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
              >
                <option value="auto">Auto (väljer bästa tillgängliga nyckel)</option>
                <option value="plant.id">Plant.id (identifiering + diagnos)</option>
                <option value="plantnet">PlantNet (enbart identifiering)</option>
                <option value="mock">Demoläge (simulerade svar, ingen API-kostnad)</option>
              </select>
              <p className="text-xs text-gray-400">
                "Auto" väljer Plant.id om nyckeln finns, annars PlantNet, annars demoläge.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Var skaffar jag API-nycklar?</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>Plant.id</strong> — <a href="https://plant.id" target="_blank" rel="noopener" className="underline">plant.id</a> · Gratis provperiod, sedan per-request-prissättning</li>
              <li><strong>PlantNet</strong> — <a href="https://my.plantnet.org" target="_blank" rel="noopener" className="underline">my.plantnet.org</a> · Gratis för begränsad användning</li>
            </ul>
          </div>

          {/* Dölj spara-knappen för Provider-sektionen, den är gemensam */}
        </SettingsSection>
      </Card>

      {/* ── Aktivera/inaktivera funktioner ───────────────────────── */}
      <Card>
        <SectionHeader icon={Power} title="Funktioner" description="Slå på eller av växtanalys-funktioner för användarna" />
        <SettingsSection action={saveAiSettings}>
          <div className="space-y-4">
            <Toggle
              label="Aktivera växtidentifiering (/vaxtidentifiering)"
              name={SETTINGS.AI_IDENTIFICATION_ON}
              defaultChecked={s.identEnabled}
              hint="Användare kan ladda upp bild och få växtförslag."
            />
            <Toggle
              label="Aktivera växtdiagnos (/vaxtdiagnos)"
              name={SETTINGS.AI_DIAGNOSIS_ON}
              defaultChecked={s.diagEnabled}
              hint="Användare kan analysera symptom och få diagnoser."
            />
          </div>
        </SettingsSection>
      </Card>

      {/* ── Gratisgräns & premium-förberedelse ───────────────────── */}
      <Card>
        <SectionHeader
          icon={BarChart3}
          title="Gratisgräns & premium"
          description="Styr hur många gratis analyser inloggade användare får per månad"
        />
        <SettingsSection action={saveAiSettings}>
          <Field
            label="Max gratis analyser per månad (per användare)"
            name={SETTINGS.AI_FREE_CHECKS_PER_MONTH}
            defaultValue={s.freeChecks}
            type="number"
            placeholder="3"
            hint="Gäller identifieringar och diagnoser sammanlagt. 0 = obegränsat. Icke inloggade kan inte analysera."
          />
          <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 text-xs text-purple-700 space-y-1">
            <p className="font-semibold">📋 Premium-förberedelse</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Gratis: begränsat antal analyser/månad (detta värde)</li>
              <li>Premium (kommande): obegränsade analyser, full historik, personliga åtgärdsplaner</li>
              <li>Ändra gränsen här när premium-nivåerna aktiveras</li>
            </ul>
          </div>
        </SettingsSection>
      </Card>

      {/* ── Disclaimer-text ───────────────────────────────────────── */}
      <Card>
        <SectionHeader
          icon={Bot}
          title="Disclaimer"
          description="Text som visas under AI-analysresultaten"
        />
        <SettingsSection action={saveAiSettings}>
          <Field
            label="Disclaimer-text"
            name={SETTINGS.AI_DISCLAIMER}
            defaultValue={s.disclaimer}
            placeholder="Analysen baseras på AI och är inte ett substitut för professionell rådgivning."
            textarea
            hint="Visas som en notering under analysresultaten för att tydliggöra AI:ns begränsningar."
          />
        </SettingsSection>
      </Card>
    </div>
  );
}
