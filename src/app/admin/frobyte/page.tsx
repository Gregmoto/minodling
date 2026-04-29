export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { EXCHANGE_TYPES, CATEGORIES, STATUS_CONFIG } from "@/app/frobyte/constants";
import { updateExchangeStatus, deleteExchange } from "@/app/frobyte/actions";

export const metadata: Metadata = { title: "Fröbyte & Plantbyte | Admin" };

export default async function AdminFrobyteAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params       = await searchParams;
  const activeStatus = params.status ?? "all";

  const exchanges = await prisma.seedExchange.findMany({
    where: activeStatus !== "all" ? { status: activeStatus } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      owner: { select: { username: true } },
    },
  });

  const counts = await prisma.seedExchange.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));
  const total = Object.values(countByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fröbyte & Plantbyte</h1>
          <p className="text-gray-500 text-sm mt-1">{total} annonser totalt</p>
        </div>
        <Link href="/frobyte" target="_blank"
          className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 transition-colors">
          <ExternalLink className="h-4 w-4" /> Visa live
        </Link>
      </div>

      {/* Statusfilter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all",      label: `Alla (${total})` },
          { value: "active",   label: `Aktiva (${countByStatus.active ?? 0})` },
          { value: "reserved", label: `Reserverade (${countByStatus.reserved ?? 0})` },
          { value: "closed",   label: `Avslutade (${countByStatus.closed ?? 0})` },
        ].map(({ value, label }) => (
          <Link key={value}
            href={value === "all" ? "/admin/frobyte" : `/admin/frobyte?status=${value}`}
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rubrik</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plats</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exchanges.map((e) => {
                const typeInfo   = EXCHANGE_TYPES.find((t) => t.value === e.exchangeType);
                const statusConf = STATUS_CONFIG[e.status] ?? STATUS_CONFIG.active;
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs">
                      <Link href={`/frobyte/${e.id}`} target="_blank" className="font-medium text-gray-900 hover:text-green-700 line-clamp-1 transition-colors">
                        {e.title}
                      </Link>
                      {e.variety && <p className="text-xs text-gray-400">{e.variety}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {typeInfo ? `${typeInfo.emoji} ${typeInfo.label}` : e.exchangeType}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.category ?? "–"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.location ?? "–"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusConf.cls}`}>
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{e.owner.username}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(["active", "reserved", "closed"] as const).filter((s) => s !== e.status).map((s) => (
                          <form key={s} action={async () => { "use server"; await updateExchangeStatus(e.id, s); }}>
                            <button type="submit" className="px-2 py-1 text-xs rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors whitespace-nowrap">
                              → {STATUS_CONFIG[s].label}
                            </button>
                          </form>
                        ))}
                        <DeleteButton action={async () => { "use server"; await deleteExchange(e.id); }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {exchanges.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Inga annonser hittades.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
