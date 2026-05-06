export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowRight, Inbox } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Kontaktärenden | Admin" };

const STATUS_LABEL: Record<string, string> = {
  open:        "Öppen",
  in_progress: "Pågår",
  closed:      "Stängd",
};
const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  open:        "danger",
  in_progress: "warning",
  closed:      "success",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  open:        <AlertCircle className="h-4 w-4 text-red-500" />,
  in_progress: <Clock       className="h-4 w-4 text-amber-500" />,
  closed:      <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export default async function AdminKontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const statusFilter = sp.status ?? "open";

  const [tickets, counts] = await Promise.all([
    prisma.contactTicket.findMany({
      where: statusFilter !== "all" ? { status: statusFilter } : {},
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.contactTicket.groupBy({
      by: ["status"],
      _count: { id: true },
    }).catch(() => []),
  ]);

  const countMap: Record<string, number> = {};
  counts.forEach((c) => { countMap[c.status] = c._count.id; });
  const total = Object.values(countMap).reduce((s, v) => s + v, 0);

  const FILTERS = [
    { value: "open",        label: "Öppna",    count: countMap.open ?? 0 },
    { value: "in_progress", label: "Pågår",    count: countMap.in_progress ?? 0 },
    { value: "closed",      label: "Stängda",  count: countMap.closed ?? 0 },
    { value: "all",         label: "Alla",     count: total },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontaktärenden</h1>
          <p className="text-gray-500 text-sm mt-1">
            {countMap.open ?? 0} öppna ärenden
          </p>
        </div>
      </div>

      {/* Filterflikar */}
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/kontakt?status=${f.value}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              statusFilter === f.value ? "bg-white/20" : "bg-gray-200 text-gray-600"
            }`}>
              {f.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Ticket-lista */}
      {tickets.length === 0 ? (
        <Card padding="md">
          <div className="text-center py-12">
            <Inbox className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Inga ärenden här</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter === "open" ? "Inga nya kontaktmeddelanden just nu." : "Filtrera för att se fler ärenden."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/kontakt/${ticket.id}`}
              className="block"
            >
              <Card padding="none" className="hover:border-green-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4 p-4">
                  <div className="mt-0.5 shrink-0">
                    {STATUS_ICON[ticket.status] ?? <MessageSquare className="h-4 w-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {ticket.subject ?? `Meddelande från ${ticket.name}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {ticket.name} · <span className="font-mono text-xs">{ticket.email}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"} size="sm">
                          {STATUS_LABEL[ticket.status] ?? ticket.status}
                        </Badge>
                        <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {ticket.message}
                    </p>
                    {ticket.reply && (
                      <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Besvarad
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
