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

export async function saveAiSettings(_: unknown, fd: FormData) {
  const get = (k: string) => (fd.get(k) as string | null) ?? "";

  await Promise.all([
    upsertSetting(SETTINGS.AI_PROVIDER,              get(SETTINGS.AI_PROVIDER)),
    upsertSetting(SETTINGS.AI_PLANT_ID_KEY,          get(SETTINGS.AI_PLANT_ID_KEY)),
    upsertSetting(SETTINGS.AI_PLANTNET_KEY,          get(SETTINGS.AI_PLANTNET_KEY)),
    upsertSetting(SETTINGS.AI_IDENTIFICATION_ON,     fd.has(SETTINGS.AI_IDENTIFICATION_ON) ? "true" : "false"),
    upsertSetting(SETTINGS.AI_DIAGNOSIS_ON,          fd.has(SETTINGS.AI_DIAGNOSIS_ON)      ? "true" : "false"),
    upsertSetting(SETTINGS.AI_FREE_CHECKS_PER_MONTH, get(SETTINGS.AI_FREE_CHECKS_PER_MONTH) || "3"),
    upsertSetting(SETTINGS.AI_DISCLAIMER,            get(SETTINGS.AI_DISCLAIMER)),
  ]);

  revalidateTag("settings");
  return ok;
}
