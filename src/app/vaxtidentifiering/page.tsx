import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Leaf, History, ExternalLink, Sprout } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getNavUser } from "@/lib/nav-user";
import { getAiSettings } from "@/lib/ai-settings";
import { checkAiUsage } from "@/lib/ai-usage";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PlantIdentifier } from "./PlantIdentifier";
import type { IdentificationResult } from "@/app/api/identify-plant/route";

export const metadata: Metadata = {
  title: "Identifiera växt",
  description:
    "Ladda upp ett foto av din växt och få svar direkt – vi identifierar växtarten med hjälp av AI och matchar mot vår växtdatabas.",
};

// ── Hjälpfunktion: kolla om API-nyckel finns ─────────────────────

async function getIsMock(): Promise<boolean> {
  const [plantId, plantNet] = await Promise.all([
    prisma.adminSetting.findUnique({ where: { key: "plant_id_api_key" }, select: { value: true } }).catch(() => null),
    prisma.adminSetting.findUnique({ where: { key: "plantnet_api_key" }, select: { value: true } }).catch(() => null),
  ]);
  return !plantId?.value?.trim() && !plantNet?.value?.trim();
}

// ── Historik för inloggad användare ──────────────────────────────

async function getRecentIdentifications(profileId: string) {
  return prisma.plantIdentification.findMany({
    where:   { userId: profileId },
    orderBy: { createdAt: "desc" },
    take:    10,
    select: {
      id:          true,
      imageUrl:    true,
      apiProvider: true,
      createdAt:   true,
      resultsJson: true,
    },
  }).catch(() => []);
}

// ── Page ──────────────────────────────────────────────────────────

export default async function VaxtidentifieringPage() {
  const user = await getCurrentUser();

  // Hämta profil + isMock + navUser + AI-inställningar parallellt
  const [profile, isMock, navUser, aiSettings] = await Promise.all([
    user
      ? prisma.profile.findUnique({
          where:  { userId: user.id },
          select: { id: true, username: true },
        }).catch(() => null)
      : null,
    getIsMock(),
    getNavUser(user?.id),
    getAiSettings(),
  ]);

  // Nuvarande användning den här månaden
  const usageInfo = profile
    ? await checkAiUsage(profile.id, "identification", aiSettings.freeChecksPerMonth)
    : null;

  // Historik bara om inloggad
  const history = profile ? await getRecentIdentifications(profile.id) : [];

  return (
    <>
      <Navbar user={navUser} />

      <main className="min-h-screen bg-gray-50">
        {/* ── Hero ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
            <Breadcrumbs
              items={[{ name: "Identifiera växt", href: "/vaxtidentifiering" }]}
            />
            <div className="mt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                <Sprout className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Identifiera din växt
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Ladda upp ett foto – vi identifierar arten på sekunder
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Huvud-innehåll ── */}
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

          {/* Identifieringsverktyget */}
          <PlantIdentifier
            isMock={isMock}
            isLoggedIn={!!profile}
            usedThisMonth={usageInfo?.used ?? 0}
            limit={aiSettings.freeChecksPerMonth}
          />

          {/* ── Tips ── */}
          <div className="rounded-3xl border border-sage-100 bg-sage-50/50 p-6">
            <h2 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              Tips för bästa resultat
            </h2>
            <ul className="text-sm text-gray-500 space-y-1.5 list-disc list-inside">
              <li>Fotografera i bra ljus, gärna utomhus</li>
              <li>Visa hela växten – blad, stam och gärna blomma</li>
              <li>Undvik suddig bild och störande bakgrund</li>
              <li>Närbild på ett enstaka blad fungerar också bra</li>
            </ul>
          </div>

          {/* ── Historik (inloggade) ── */}
          {history.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-green-600" />
                Dina senaste identifieringar
              </h2>
              <div className="space-y-3">
                {history.map((item) => {
                  const results = item.resultsJson as unknown as IdentificationResult[];
                  const top     = results?.[0];
                  if (!top) return null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-sm transition-shadow"
                    >
                      {/* Thumbnail */}
                      {item.imageUrl && (
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={top.latinName ?? "Växt"}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {top.commonName ?? top.latinName}
                        </p>
                        <p className="text-xs text-gray-400 italic">{top.latinName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString("sv-SE", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                          {" · "}
                          {top.probability}% säkerhet
                        </p>
                      </div>

                      {/* DB-länk */}
                      {top.dbPlant && (
                        <Link
                          href={`/vaxtdatabas/${top.dbPlant.slug}`}
                          className="shrink-0 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Se växt
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
