export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ExternalLink, Pencil } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteChallenge } from "@/app/utmaningar/actions";

export const metadata: Metadata = { title: "Utmaningar | Admin" };

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  active:   "bg-green-100 text-green-700",
  ended:    "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  upcoming: "Kommande", active: "Pågående", ended: "Avslutad",
};

export default async function AdminUtmaningarPage() {
  const challenges = await prisma.challenge.findMany({
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
    include: {
      _count: { select: { participants: true, entries: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utmaningar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{challenges.length} utmaning{challenges.length !== 1 ? "ar" : ""}</p>
        </div>
        <Link href="/admin/utmaningar/ny"
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" /> Ny utmaning
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        {challenges.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">Inga utmaningar skapade ännu.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Titel</th>
                <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Slutdatum</th>
                <th className="px-4 py-3 hidden md:table-cell">Deltagare</th>
                <th className="px-4 py-3 hidden lg:table-cell">Bidrag</th>
                <th className="px-4 py-3 hidden sm:table-cell">Publicerad</th>
                <th className="px-4 py-3 text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {challenges.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{c.title}</div>
                    {c.category && <div className="text-xs text-gray-400">{c.category}</div>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status] ?? STATUS_STYLE.upcoming}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {c.endDate ? formatDate(c.endDate) : "–"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {c._count.participants}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                    {c._count.entries}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {c.published ? (
                      <span className="text-green-600 text-xs font-medium">✓ Ja</span>
                    ) : (
                      <span className="text-gray-400 text-xs">Nej</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/utmaningar/${c.slug}`} target="_blank"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={`/admin/utmaningar/${c.id}/redigera`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <DeleteButton
                        action={deleteChallenge.bind(null, c.id)}
                        label="Ta bort"
                        confirmText={`Ta bort utmaningen "${c.title}"? Alla bidrag och kommentarer raderas.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
