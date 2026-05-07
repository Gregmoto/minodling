/**
 * Räknar och begränsar AI-analyser per användare och månad.
 * Returnerar { allowed, used, limit } och kan öka räknaren.
 */

import prisma from "./prisma";

export type FeatureType = "identification" | "diagnosis";

interface UsageResult {
  allowed: boolean;
  used:    number;
  limit:   number;
}

/** Kontrollera om användaren har analyser kvar denna månad */
export async function checkAiUsage(
  profileId: string,
  feature:   FeatureType,
  limit:     number,
): Promise<UsageResult> {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  try {
    const row = await prisma.aiUsage.findUnique({
      where: {
        userId_featureType_month_year: {
          userId:      profileId,
          featureType: feature,
          month,
          year,
        },
      },
      select: { count: true },
    });

    const used = row?.count ?? 0;
    return { allowed: used < limit, used, limit };
  } catch {
    // Vid DB-fel: tillåt för att inte blockera användaren
    return { allowed: true, used: 0, limit };
  }
}

/** Öka räknaren (anropas efter lyckad analys) */
export async function incrementAiUsage(
  profileId: string,
  feature:   FeatureType,
): Promise<void> {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  try {
    await prisma.aiUsage.upsert({
      where: {
        userId_featureType_month_year: {
          userId:      profileId,
          featureType: feature,
          month,
          year,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        userId:      profileId,
        featureType: feature,
        count:       1,
        month,
        year,
      },
    });
  } catch (err) {
    console.error("[ai-usage] increment failed:", err);
  }
}

/** Logga ett misslyckat AI-anrop */
export async function logAiFailure(opts: {
  feature:  FeatureType;
  provider: string;
  error:    string;
  profileId?: string | null;
}): Promise<void> {
  console.error(`[ai-failure] ${opts.feature} via ${opts.provider}:`, opts.error, {
    profileId: opts.profileId,
  });
  // Utökad loggning kan läggas till här (t.ex. Sentry, DB-tabell)
}
