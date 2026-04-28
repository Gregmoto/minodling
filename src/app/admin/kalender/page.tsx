export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteCalendarEntry } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Odlingskalender | Admin" };

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];

const MONTH_FULL = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December",
];

function statusBadge(status: string) {
  if (status === "published") return <Badge variant="success">Publicerad</Badge>;
  if (status === "pending")   return <Badge variant="warning">Väntar</Badge>;
  return <Badge variant="default">Utkast</Badge>;
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;

  const entries = await prisma.gardenCalendar.findMany({
    where: params.month ? { month: parseInt(params.month) } : {},
    orderBy: [{ month: "asc" }, { createdAt: "desc" }],
  });

  const activeMonth = params.month ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Odlingskalender</h1>
          <p className="text-gray-500 text-sm mt-1">{entries.length} totalt</p>
        </div>
      </div>

      {/* Månadsfilter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/kalender"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeMonth === "all"
              ? "bg-sage-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Alla
        </Link>
        {MONTHS.map((label, i) => {
          const monthNum = String(i + 1);
          return (
            <Link
              key={monthNum}
              href={`/admin/kalender?month=${monthNum}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeMonth === monthNum
                  ? "bg-sage-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{entry.title}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {entry.month >= 1 && entry.month <= 12
                      ? MONTH_FULL[entry.month - 1]
                      : entry.month}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{entry.category ?? "–"}</td>
                  <td className="px-4 py-3 text-gray-500">{entry.taskType ?? "–"}</td>
                  <td className="px-4 py-3">{statusBadge(entry.status)}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton action={async () => { "use server"; await deleteCalendarEntry(entry.id); }} />
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Inga kalenderposter hittades.
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
