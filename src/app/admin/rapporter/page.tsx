import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { updateReportStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rapporter | Admin" };

const STATUS_LABELS: Record<string, string> = {
  all: "Alla",
  pending: "Väntar",
  reviewed: "Hanterade",
  dismissed: "Avfärdade",
};

function statusBadge(status: string) {
  if (status === "pending") return <Badge variant="danger">Väntar</Badge>;
  if (status === "reviewed") return <Badge variant="success">Hanterad</Badge>;
  if (status === "dismissed") return <Badge variant="default">Avfärdad</Badge>;
  return <Badge>{status}</Badge>;
}

export default async function RapporterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  const [reports, counts] = await Promise.all([
    prisma.report.findMany({
      where: { ...(params.status ? { status: params.status } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: { select: { username: true } },
        handler: { select: { username: true } },
      },
    }),
    prisma.report.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count.id])
  );
  const totalCount = counts.reduce((sum, c) => sum + c._count.id, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Rapporter</h1>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(STATUS_LABELS).map(([value, label]) => {
          const active = (params.status ?? "all") === value;
          const href =
            value === "all" ? "/admin/rapporter" : `/admin/rapporter?status=${value}`;
          const count =
            value === "all" ? totalCount : (countMap[value] ?? 0);
          return (
            <Link
              key={value}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                active
                  ? "bg-sage-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${
                  active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Anledning</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Anmält av</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Hanterat av</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Inga rapporter hittades.
                </td>
              </tr>
            )}
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Badge variant="outline">{report.targetType}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                  <span className="line-clamp-1">{report.reason}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {report.reporter?.username ?? "–"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {report.handler?.username ?? "–"}
                </td>
                <td className="px-4 py-3">{statusBadge(report.status)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(report.createdAt)}</td>
                <td className="px-4 py-3">
                  {report.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await updateReportStatus(report.id, "reviewed");
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          Hanterat
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await updateReportStatus(report.id, "dismissed");
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Avfärda
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
