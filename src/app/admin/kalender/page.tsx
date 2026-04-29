export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ApproveRejectButtons } from "@/components/admin/ApproveRejectButtons";
import { formatDate } from "@/lib/utils";
import { deleteCalendarEntry, updateCalendarEntryStatus } from "@/app/admin/actions";
import { MONTHS } from "@/lib/calendar";

export const metadata: Metadata = { title: "Odlingskalender | Admin" };

const MONTH_FULL  = MONTHS.map((m) => m.full);
const MONTH_SHORT = MONTHS.map((m) => m.short);

function statusBadge(status: string, isUserSuggested: boolean) {
  if (status === "published") return <Badge variant="success">Publicerad</Badge>;
  if (status === "pending")   return <Badge variant="warning">{isUserSuggested ? "💡 Förslag" : "Väntar"}</Badge>;
  if (status === "rejected")  return <Badge variant="danger">Nekad</Badge>;
  return <Badge variant="default">Utkast</Badge>;
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; status?: string }>;
}) {
  const params = await searchParams;
  const activeMonth  = params.month  ?? "all";
  const activeStatus = params.status ?? "all";

  const pendingCount = await prisma.gardenCalendar.count({ where: { status: "pending" } });

  const entries = await prisma.gardenCalendar.findMany({
    where: {
      ...(activeMonth  !== "all" ? { month:  parseInt(activeMonth) } : {}),
      ...(activeStatus !== "all" ? { status: activeStatus }          : {}),
    },
    orderBy: [{ status: "asc" }, { month: "asc" }, { createdAt: "desc" }],
    include: { suggester: { select: { username: true } } },
  });

  function monthUrl(m: string) {
    const p = new URLSearchParams();
    if (m !== "all")            p.set("month",  m);
    if (activeStatus !== "all") p.set("status", activeStatus);
    return `/admin/kalender${p.toString() ? `?${p}` : ""}`;
  }
  function statusUrl(s: string) {
    const p = new URLSearchParams();
    if (activeMonth !== "all") p.set("month",  activeMonth);
    if (s !== "all")           p.set("status", s);
    return `/admin/kalender${p.toString() ? `?${p}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Odlingskalender</h1>
          <p className="text-gray-500 text-sm mt-1">{entries.length} poster</p>
        </div>
        <Link
          href="/admin/kalender/ny"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-sage-600 text-white hover:bg-sage-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Ny post
        </Link>
      </div>

      {/* Förslag-alert */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            💡 {pendingCount} användarförslag väntar på granskning
          </p>
          <Link href={statusUrl("pending")} className="text-sm font-medium text-amber-700 hover:underline">
            Visa förslag →
          </Link>
        </div>
      )}

      {/* Statusfilter */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Alla",        value: "all" },
          { label: "Publicerade", value: "published" },
          { label: "Förslag",     value: "pending" },
          { label: "Nekade",      value: "rejected" },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={statusUrl(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === opt.value
                ? "bg-sage-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {opt.label}
            {opt.value === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Månadsfilter */}
      <div className="flex flex-wrap gap-2">
        <Link href={monthUrl("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          activeMonth === "all" ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}>Alla</Link>
        {MONTH_SHORT.map((label, i) => {
          const num = String(i + 1);
          return (
            <Link key={num} href={monthUrl(num)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeMonth === num ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>{label}</Link>
          );
        })}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Månad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Zon</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-gray-50 ${entry.status === "pending" ? "bg-amber-50/40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 max-w-xs truncate">{entry.title}</div>
                    {entry.isUserSuggested && entry.suggester && (
                      <div className="text-xs text-gray-400">av @{entry.suggester.username}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {entry.month >= 1 && entry.month <= 12 ? MONTH_FULL[entry.month - 1] : entry.month}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{entry.taskType ?? "–"}</td>
                  <td className="px-4 py-3 text-gray-500">{entry.category ?? "–"}</td>
                  <td className="px-4 py-3 text-gray-500">{entry.growingZone ? `Zon ${entry.growingZone}` : "–"}</td>
                  <td className="px-4 py-3">{statusBadge(entry.status, entry.isUserSuggested)}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.status === "pending" && (
                        <ApproveRejectButtons
                          approveAction={async () => { "use server"; await updateCalendarEntryStatus(entry.id, "published"); }}
                          rejectAction={async ()  => { "use server"; await updateCalendarEntryStatus(entry.id, "rejected"); }}
                        />
                      )}
                      <Link
                        href={`/admin/kalender/${entry.id}/redigera`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Redigera
                      </Link>
                      <DeleteButton action={async () => { "use server"; await deleteCalendarEntry(entry.id); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Inga poster hittades.
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
