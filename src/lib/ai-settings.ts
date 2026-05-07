/**
 * AI-inställningar – laddas utan cache (används i API-routes där freshness krävs).
 * Returnerar typade värden och hanterar saknade nycklar med defaults.
 */

import prisma from "./prisma";

export interface AiSettings {
  provider:              "plant.id" | "plantnet" | "mock";
  plantIdKey:            string | null;
  plantNetKey:           string | null;
  diagPlantIdKey:        string | null;
  identificationEnabled: boolean;
  diagnosisEnabled:      boolean;
  freeChecksPerMonth:    number;
  disclaimerText:        string;
}

const DEFAULTS: AiSettings = {
  provider:              "mock",
  plantIdKey:            null,
  plantNetKey:           null,
  diagPlantIdKey:        null,
  identificationEnabled: true,
  diagnosisEnabled:      true,
  freeChecksPerMonth:    3,
  disclaimerText:        "Analysen baseras på AI och är inte ett substitut för professionell rådgivning.",
};

const AI_KEYS = [
  "plant_ai_provider",
  "plant_id_api_key",
  "plantnet_api_key",
  "diag_plant_id_key",
  "plant_identification_enabled",
  "plant_diagnosis_enabled",
  "free_ai_checks_per_month",
  "plant_ai_disclaimer_text",
] as const;

export async function getAiSettings(): Promise<AiSettings> {
  try {
    const rows = await prisma.adminSetting.findMany({
      where: { key: { in: [...AI_KEYS] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.value) map[r.key] = r.value;
    }

    const plantIdKey  = map["plant_id_api_key"]?.trim()  || null;
    const plantNetKey = map["plantnet_api_key"]?.trim()  || null;
    const diagPlantIdKey = map["diag_plant_id_key"]?.trim() || map["plant_id_api_key"]?.trim() || null;

    // Välj provider: inställning → auto-detect utifrån vilka nycklar som finns
    let provider: AiSettings["provider"] = "mock";
    const savedProvider = map["plant_ai_provider"]?.trim();
    if (savedProvider === "plant.id" && plantIdKey)  provider = "plant.id";
    else if (savedProvider === "plantnet" && plantNetKey) provider = "plantnet";
    else if (plantIdKey)  provider = "plant.id";
    else if (plantNetKey) provider = "plantnet";

    return {
      provider,
      plantIdKey,
      plantNetKey,
      diagPlantIdKey,
      identificationEnabled: map["plant_identification_enabled"] !== "false",
      diagnosisEnabled:      map["plant_diagnosis_enabled"]      !== "false",
      freeChecksPerMonth:    parseInt(map["free_ai_checks_per_month"] ?? "3", 10) || 3,
      disclaimerText:        map["plant_ai_disclaimer_text"] || DEFAULTS.disclaimerText,
    };
  } catch {
    return DEFAULTS;
  }
}
