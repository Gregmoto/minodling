export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { PROBLEM_TYPES, STATUS_LABELS } from "@/app/vaxtdiagnos/constants";
import { updateDiagnosisStatus, deleteDiagnosis } from "@/app/vaxtdiagnos/actions";

export const metadata: Metadata = { title: "Växtdiagnos | Admin" };

export default async function AdminVaxtdiagnosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status ?? "all";

  const diagnoses = await prisma.plantDiagnosis.findMany({
    where: activeStatus !== "all" ? { status: activeStatus } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      profile: { select: { username: true } },
      plant:   { select: { name: true } },
      _count:  { select: { comments: true } },
    },
  });

  const counts = await prisma.plantDiagnosis.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));
  const total = Object.values(countByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Växtdiagnos</h1>
          <p className="text-gray-500 text-sm mt-1">{total} totalt</p>
        </div>
        <Link href="/vaxtdiagnos" target="_blank"
          className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 transition-colors">
          <ExternalLink className="h-4 w-4" /> Visa live
        </Link>
      </div>

      {/* Statusfilter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all",      label: `Alla (${total})` },
          { value: "open",     label: `Öppna (${countByStatus.open ?? 0})` },
          { value: "diagnosed",label: `Diagnos (${countByStatus.diagnosed ?? 0})` },
          { value: "resolved", label: `Lösta (${countByStatus.resolved ?? 0})` },
        ].map(({ value, label }) => (
          <Link key={value}
            href={value === "all" ? "/admin/vaxtdiagnos" : `/admin/vaxtdiagnos?status=${value}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              activeStatus === value ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {label}
          </Link>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Bild</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Beskrivning</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Växt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Svar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {diagnoses.map((d) => {
                const problemInfo = PROBLEM_TYPES.find((p) => p.value === d.problemType);
                const statusInfo  = STATUS_LABELS[d.status] ?? STATUS_LABELS["open"];
                const plantLabel  = d.plant?.name ?? d.plantName;
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.imageUrl} alt="" className="h-12 w-16 object-cover rounded-lg" />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <Link href={`/vaxtdiagnos/${d.id}`} target="_blank" className="text-gray-700 hover:text-green-700 line-clamp-2">
                        {d.description}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{plantLabel ?? "–"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {problemInfo ? <span>{problemInfo.emoji} {problemInfo.label}</span> : "–"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={d.status}
                        onChange={async () => {}}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-center">{d._count.comments}</td>
                    <td className="px-4 py-3 text-gray-500">{d.profile.username}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(["open","diagnosed","resolved"] as const).map((s) => s !== d.status && (
                          <form key={s} action={async () => { "use server"; await updateDiagnosisStatus(d.id, s); }}>
                            <button type="submit" className="px-2 py-1 text-xs rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                              → {STATUS_LABELS[s].label}
                            </button>
                          </form>
                        ))}
                        <DeleteButton action={async () => { "use server"; await deleteDiagnosis(d.id); }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {diagnoses.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    Inga diagnoser hittades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
