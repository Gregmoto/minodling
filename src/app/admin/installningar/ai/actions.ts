"use server";

import prisma from "@/lib/prisma";
import { SETTINGS } from "@/lib/settings";
import { revalidateTag } from "next/cache";

const ok = { ok: true } as const;

async function upsertSetting(key: string, value: string) {
  await prisma.adminSetting.upsert({
    where:  { key },
    update: { value },
    create: { key, value },
  });
}

/** Sparar enbart API-nycklar + provider-val */
export async function saveAiKeys(_: unknown, fd: FormData) {
  const get = (k: string) => (fd.get(k) as string | null) ?? "";
  await Promise.all([
    upsertSetting(SETTINGS.AI_PROVIDER,     get(SETTINGS.AI_PROVIDER)),
    upsertSetting(SETTINGS.AI_PLANT_ID_KEY, get(SETTINGS.AI_PLANT_ID_KEY)),
    upsertSetting(SETTINGS.AI_PLANTNET_KEY, get(SETTINGS.AI_PLANTNET_KEY)),
  ]);
  revalidateTag("settings");
  return ok;
}

/** Sparar enbart aktivera/inaktivera-toggles */
export async function saveAiToggles(_: unknown, fd: FormData) {
  await Promise.all([
    upsertSetting(SETTINGS.AI_IDENTIFICATION_ON, fd.has(SETTINGS.AI_IDENTIFICATION_ON) ? "true" : "false"),
    upsertSetting(SETTINGS.AI_DIAGNOSIS_ON,      fd.has(SETTINGS.AI_DIAGNOSIS_ON)      ? "true" : "false"),
  ]);
  revalidateTag("settings");
  return ok;
}

/** Sparar enbart gratisgräns */
export async function saveAiFreeChecks(_: unknown, fd: FormData) {
  const val = (fd.get(SETTINGS.AI_FREE_CHECKS_PER_MONTH) as string | null) ?? "3";
  await upsertSetting(SETTINGS.AI_FREE_CHECKS_PER_MONTH, val || "3");
  revalidateTag("settings");
  return ok;
}

/** Sparar enbart disclaimer-text */
export async function saveAiDisclaimer(_: unknown, fd: FormData) {
  const val = (fd.get(SETTINGS.AI_DISCLAIMER) as string | null) ?? "";
  await upsertSetting(SETTINGS.AI_DISCLAIMER, val);
  revalidateTag("settings");
  return ok;
}
