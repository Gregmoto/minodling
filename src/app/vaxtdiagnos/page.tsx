export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Stethoscope } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { DiagnosisCard } from "@/components/diagnos/DiagnosisCard";
import { PROBLEM_TYPES, STATUS_LABELS } from "./constants";

export const metadata: Metadata = {
  title: "Växtdiagnos – Få hjälp med sjuka växter",
  description: "Ladda upp en bild och beskriv ditt växtproblem. Communityn hjälper dig att diagnostisera och lösa problemet.",
};

export default async function VaxtdiagnosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; typ?: string }>;
}) {
  const params  = await searchParams;
  const status  = params.status ?? "";
  const typ     = params.typ    ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await import("@/lib/prisma").then((m) =>
    m.default.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
    })
  ) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const diagnoses = await prisma.plantDiagnosis.findMany({
    where: {
      isPublic: true,
      AND: [
        status ? { status }           : {},
        typ    ? { problemType: typ } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true, imageUrl: true, description: true, plantName: true,
      problemType: true, status: true, createdAt: true,
      profile: { select: { username: true, avatarUrl: true } },
      plant:   { select: { name: true, slug: true } },
      _count:  { select: { comments: true } },
    },
  });

  const counts = await prisma.plantDiagnosis.groupBy({
    by: ["status"],
    where: { isPublic: true },
    _count: { id: true },
  });
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-b border-gray-100 py-10">
          <div className="container-main">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-green-700" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Växtdiagnos</h1>
                </div>
                <p className="text-gray-500 max-w-xl">
                  Ladda upp en bild på din sjuka växt och få hjälp av communityn att hitta problemet.
                </p>
              </div>
              {user ? (
                <Link href="/vaxtdiagnos/ny"
                  className="flex items-center gap-2 px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors shrink-0 self-start sm:self-auto">
                  <Plus className="h-4 w-4" /> Skicka in bild
                </Link>
              ) : (
                <Link href="/auth/logga-in"
                  className="flex items-center gap-2 px-5 py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors shrink-0 self-start sm:self-auto">
                  Logga in för att fråga
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container-main py-8">
          <Breadcrumbs items={[{ name: "Växtdiagnos", href: "/vaxtdiagnos" }]} className="mb-6" />

          {/* Statusfilter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: "", label: `Alla (${Object.values(countByStatus).reduce((a, b) => a + b, 0)})` },
              { value: "open",      label: `Öppna (${countByStatus.open ?? 0})` },
              { value: "diagnosed", label: `Diagnos (${countByStatus.diagnosed ?? 0})` },
              { value: "resolved",  label: `Lösta (${countByStatus.resolved ?? 0})` },
            ].map(({ value, label }) => (
              <Link key={value}
                href={value ? `/vaxtdiagnos?status=${value}${typ ? `&typ=${typ}` : ""}` : `/vaxtdiagnos${typ ? `?typ=${typ}` : ""}`}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  status === value ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Problemtypsfilter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href={`/vaxtdiagnos${status ? `?status=${status}` : ""}`}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                !typ ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              Alla typer
            </Link>
            {PROBLEM_TYPES.filter((p) => p.value !== "unknown").map((pt) => (
              <Link key={pt.value}
                href={`/vaxtdiagnos?typ=${pt.value}${status ? `&status=${status}` : ""}`}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  typ === pt.value ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {pt.emoji} {pt.label}
              </Link>
            ))}
          </div>

          {/* Grid */}
          {diagnoses.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Inga diagnoser hittades.</p>
              {user && (
                <Link href="/vaxtdiagnos/ny" className="text-sm text-green-700 hover:underline">
                  Var första att fråga →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {diagnoses.map((d) => (
                <DiagnosisCard key={d.id} diagnosis={d} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
