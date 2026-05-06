export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { toggleSubscriber } from "@/app/admin/butik/actions";

export const metadata: Metadata = { title: "Nyhetsbrev | Butik | Admin" };

const SOURCE_LABELS: Record<string, string> = {
  shop: "Butik",
  homepage: "Startsidan",
  nyhetsbrev: "Nyhetsbrev",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminNyhetsbrevPage({ searchParams }: PageProps) {
  await requireAdmin();

  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const where = search
    ? { email: { contains: search, mode: "insensitive" as const } }
    : {};

  const [subscribers, totalCount, activeCount] = await Promise.all([
    prisma.shopNewsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
    }),
    prisma.shopNewsletterSubscriber.count(),
    prisma.shopNewsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nyhetsbrev</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} prenumeranter totalt &middot; {activeCount} aktiva
          </p>
        </div>
        <Link
          href="/api/admin/nyhetsbrev-export"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-sage-300 bg-white px-4 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 transition-colors"
        >
          Exportera CSV
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Sök på e-postadress…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700 transition-colors"
        >
          Sök
        </button>
        {search && (
          <Link
            href="/admin/butik/nyhetsbrev"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Rensa
          </Link>
        )}
      </form>

      {search && (
        <p className="text-sm text-gray-500">
          Visar {subscribers.length} träff{subscribers.length !== 1 ? "ar" : ""} för &ldquo;{search}&rdquo;
        </p>
      )}

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-post</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Källa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full">
                      {SOURCE_LABELS[sub.source] ?? sub.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sub.isActive ? "success" : "danger"}>
                      {sub.isActive ? "Aktiv" : "Avregistrerad"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {formatDate(sub.subscribedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await toggleSubscriber(sub.id, !sub.isActive);
                      }}
                    >
                      <button
                        type="submit"
                        className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                          sub.isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-sage-200 text-sage-700 hover:bg-sage-50"
                        }`}
                      >
                        {sub.isActive ? "Avregistrera" : "Aktivera"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    {search ? "Inga prenumeranter matchar sökningen." : "Inga prenumeranter ännu."}
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
