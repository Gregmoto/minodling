import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Stethoscope, Plus, ArrowRight, Leaf,
  CalendarDays, ChevronRight,
} from "lucide-react";
import { requireAuth, getUserProfile } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { HEALTH_SYMPTOMS } from "@/lib/plant-health";
import { PROBLEM_STATUSES, STATUS_COLORS, getStatus } from "./constants";

export const metadata: Metadata = {
  title: "Min växtproblem-logg",
};

export default async function VaxtproblemPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAuth();
  const profile = await getUserProfile();
  if (!profile) redirect("/auth/login");

  const { status } = await searchParams;
  const filterStatus = status ?? "";

  const [checks, counts] = await Promise.all([
    prisma.plantHealthCheck.findMany({
      where: {
        userId: profile.id,
        ...(filterStatus ? { status: filterStatus } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        plant:    { select: { name: true, slug: true } },
        followUps: { select: { id: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.plantHealthCheck.groupBy({
      by:    ["status"],
      where: { userId: profile.id },
      _count: { id: true },
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));
  const total    = Object.values(countMap).reduce((a, b) => a + b, 0);

  function symptomLabel(key: string) {
    return HEALTH_SYMPTOMS.find((s) => s.key === key);
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Växtproblem-logg</h1>
          </div>
          <p className="text-sm text-gray-500">{total} diagnoser sparade</p>
        </div>
        <Link
          href="/vaxtdiagnos"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ny diagnos
        </Link>
      </div>

      {/* Statusfilter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/min-odling/vaxtproblem"
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            !filterStatus ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Alla ({total})
        </Link>
        {PROBLEM_STATUSES.map((s) => (
          <Link
            key={s.key}
            href={`/min-odling/vaxtproblem?status=${s.key}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filterStatus === s.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.emoji} {s.label} ({countMap[s.key] ?? 0})
          </Link>
        ))}
      </div>

      {/* Tom state */}
      {checks.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
            <Stethoscope className="h-8 w-8 text-gray-300" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Inga diagnoser ännu</p>
            <p className="text-sm text-gray-400 mt-1">
              {filterStatus
                ? "Inga diagnoser med denna status."
                : "Gå till Växtdiagnos och analysera din första växt."}
            </p>
          </div>
          <Link
            href="/vaxtdiagnos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Stethoscope className="h-4 w-4" />
            Diagnostisera en växt
          </Link>
        </div>
      )}

      {/* Lista */}
      <div className="grid gap-3 sm:grid-cols-2">
        {checks.map((check) => {
          const status     = getStatus(check.status);
          const topSymptom = check.symptoms[0] ? symptomLabel(check.symptoms[0]) : null;
          const resultsArr = check.resultsJson as { problemLabel?: string; probability?: number }[];
          const topResult  = resultsArr?.[0];

          return (
            <Link
              key={check.id}
              href={`/min-odling/vaxtproblem/${check.id}`}
              className="group flex gap-4 p-4 rounded-2xl border border-gray-200 bg-white hover:border-green-200 hover:shadow-sm transition-all"
            >
              {/* Thumbnail */}
              <div className="shrink-0">
                {check.imageUrl ? (
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-gray-100">
                    <Image
                      src={check.imageUrl}
                      alt="Växtbild"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {check.plant?.name ?? topResult?.problemLabel ?? "Växtproblem"}
                    </p>
                    {topResult?.problemLabel && check.plant?.name && (
                      <p className="text-xs text-gray-500 truncate">{topResult.problemLabel}</p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border ${STATUS_COLORS[check.status]}`}>
                    {status.emoji} {status.label}
                  </span>
                </div>

                {/* Symptom-chips */}
                {check.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {check.symptoms.slice(0, 3).map((sym) => {
                      const s = symptomLabel(sym);
                      return s ? (
                        <span key={sym} className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          {s.emoji} {s.label}
                        </span>
                      ) : null;
                    })}
                    {check.symptoms.length > 3 && (
                      <span className="text-xs text-gray-400">+{check.symptoms.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(check.createdAt).toLocaleDateString("sv-SE", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                    {check.followUps.length > 0 && (
                      <span className="ml-2 text-green-600">· {check.followUps.length} uppföljning{check.followUps.length > 1 ? "ar" : ""}</span>
                    )}
                  </p>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-green-600 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Länk till ny diagnos */}
      {checks.length > 0 && (
        <div className="text-center pt-4">
          <Link
            href="/vaxtdiagnos"
            className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium"
          >
            <Plus className="h-4 w-4" />
            Diagnostisera en ny växt
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
