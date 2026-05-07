export const revalidate = 60;
import type { Metadata } from "next";
import Link from "next/link";
import { Stethoscope, Plus, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { DiagnosisCard } from "@/components/diagnos/DiagnosisCard";
import { DiagnosisWizard } from "./DiagnosisWizard";
import { PROBLEM_TYPES } from "./constants";

export const metadata: Metadata = {
  title: "Växtdiagnos – Vad är fel på min växt?",
  description:
    "Ladda upp ett foto och välj symptom – få möjliga orsaker och lösningar på ditt växtproblem. Backas upp av AI och vår community.",
};

// ── Kolla om API-nyckel finns ─────────────────────────────────────

async function getIsMock(): Promise<boolean> {
  const setting = await prisma.adminSetting.findUnique({
    where:  { key: "plant_id_api_key" },
    select: { value: true },
  }).catch(() => null);
  return !setting?.value?.trim();
}

// ── Hämta växtlista för wizard ────────────────────────────────────

async function getPlants() {
  return prisma.plant.findMany({
    select: { id: true, name: true, slug: true, latinName: true },
    orderBy: { name: "asc" },
    take: 200,
  }).catch(() => []);
}

// ── Page ──────────────────────────────────────────────────────────

export default async function VaxtdiagnosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; typ?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const typ    = params.typ    ?? "";

  const user = await getCurrentUser();

  const [plants, isMock, navUser, diagnoses, counts] = await Promise.all([
    getPlants(),
    getIsMock(),
    getNavUser(user?.id),
    // Community-diagnoser för nedre sektionen
    prisma.plantDiagnosis.findMany({
      where: {
        isPublic: true,
        AND: [
          status ? { status }           : {},
          typ    ? { problemType: typ } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true, imageUrl: true, description: true, plantName: true,
        problemType: true, status: true, createdAt: true,
        profile: { select: { username: true, avatarUrl: true } },
        plant:   { select: { name: true, slug: true } },
        _count:  { select: { comments: true } },
      },
    }).catch(() => []),
    prisma.plantDiagnosis.groupBy({
      by: ["status"],
      where: { isPublic: true },
      _count: { id: true },
    }).catch(() => []),
  ]);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));
  const totalDiagnoses = Object.values(countByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-gray-50">

        {/* ── Hero ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
            <Breadcrumbs
              items={[
                { name: "Hem", href: "/" },
                { name: "Växtdiagnos", href: "/vaxtdiagnos" },
              ]}
            />
            <div className="mt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                <Stethoscope className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Vad är fel på min växt?
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Ladda upp ett foto och välj symptom – få möjliga orsaker direkt
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI-wizard ── */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <DiagnosisWizard plants={plants} isMock={isMock} isLoggedIn={!!user} />
        </div>

        {/* ── Community-diagnoser ── */}
        <div className="border-t border-gray-200 bg-white mt-4">
          <div className="max-w-7xl mx-auto px-4 py-10">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Community-diagnoser
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {totalDiagnoses} diagnoser från odlare i vår community
                </p>
              </div>
              {user ? (
                <Link
                  href="/vaxtdiagnos/ny"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Ställ en fråga
                </Link>
              ) : (
                <Link
                  href="/auth/login?redirect=/vaxtdiagnos/ny"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Logga in och fråga
                </Link>
              )}
            </div>

            {/* Filter-status */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { value: "",          label: `Alla (${totalDiagnoses})` },
                { value: "open",      label: `Öppna (${countByStatus.open ?? 0})` },
                { value: "diagnosed", label: `Diagnos (${countByStatus.diagnosed ?? 0})` },
                { value: "resolved",  label: `Lösta (${countByStatus.resolved ?? 0})` },
              ].map(({ value, label }) => (
                <Link
                  key={value}
                  href={value
                    ? `/vaxtdiagnos?status=${value}${typ ? `&typ=${typ}` : ""}`
                    : `/vaxtdiagnos${typ ? `?typ=${typ}` : ""}`}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    status === value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Problemtypsfilter */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Link
                href={`/vaxtdiagnos${status ? `?status=${status}` : ""}`}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  !typ ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Alla typer
              </Link>
              {PROBLEM_TYPES.filter((p) => p.value !== "unknown").map((pt) => (
                <Link
                  key={pt.value}
                  href={`/vaxtdiagnos?typ=${pt.value}${status ? `&status=${status}` : ""}`}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    typ === pt.value
                      ? "bg-gray-800 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pt.emoji} {pt.label}
                </Link>
              ))}
            </div>

            {/* Grid */}
            {diagnoses.length === 0 ? (
              <div className="text-center py-16">
                <Stethoscope className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Inga diagnoser hittades.</p>
                {user && (
                  <Link href="/vaxtdiagnos/ny" className="text-sm text-green-700 hover:underline">
                    Var första att fråga →
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {diagnoses.map((d) => (
                    <DiagnosisCard key={d.id} diagnosis={d} />
                  ))}
                </div>

                {totalDiagnoses > 12 && (
                  <div className="text-center mt-8">
                    <p className="text-sm text-gray-400">
                      Visar 12 av {totalDiagnoses} diagnoser
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
