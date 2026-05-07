import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireAuth, getUserProfile } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { HEALTH_SYMPTOMS } from "@/lib/plant-health";
import { getStatus } from "../constants";
import { ProblemDetail } from "./ProblemDetail";
import { deleteDiagnosis } from "../actions";

export const metadata: Metadata = { title: "Växtproblem-detalj" };

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const profile = await getUserProfile();
  if (!profile) redirect("/auth/login");

  const { id } = await params;

  const check = await prisma.plantHealthCheck.findFirst({
    where: { id, userId: profile.id },
    include: {
      plant:     { select: { name: true, slug: true } },
      followUps: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!check) notFound();

  const status = getStatus(check.status);

  return (
    <div className="space-y-6">

      {/* Tillbaka + header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/min-odling/vaxtproblem"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till loggen
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {check.plant?.name ?? "Växtproblem"}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {new Date(check.createdAt).toLocaleDateString("sv-SE", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs font-medium">
              {status.emoji} {status.label}
            </span>
          </div>
        </div>

        {/* Radera */}
        <form
          action={async () => {
            "use server";
            await deleteDiagnosis(id);
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 text-xs font-medium transition-colors"
            title="Radera diagnos"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Radera
          </button>
        </form>
      </div>

      <ProblemDetail
        check={{
          ...check,
          plant:    check.plant    ?? null,
          followUps: check.followUps,
        }}
        symptoms={HEALTH_SYMPTOMS as unknown as { key: string; label: string; emoji: string }[]}
      />
    </div>
  );
}
