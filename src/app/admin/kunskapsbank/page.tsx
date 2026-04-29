export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Edit2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { toggleArticlePublished, deleteArticle } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Kunskapsbank | Admin" };

export default async function KunskapsbanksPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>;
}) {
  const params = await searchParams;
  const articles = await prisma.knowledgeArticle.findMany({
    where: params.published !== undefined ? { published: params.published === "true" } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const activeFilter = params.published ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunskapsbank</h1>
          <p className="text-gray-500 text-sm mt-1">{articles.length} artiklar</p>
        </div>
        <Link href="/admin/kunskapsbank/ny"
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" /> Ny artikel
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all",   label: "Alla" },
          { value: "true",  label: "Publicerade" },
          { value: "false", label: "Utkast" },
        ].map(({ value, label }) => (
          <Link key={value}
            href={value === "all" ? "/admin/kunskapsbank" : `/admin/kunskapsbank?published=${value}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === value ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                    <span className="line-clamp-1">{a.title}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.category ?? "–"}</td>
                  <td className="px-4 py-3">
                    {a.published ? <Badge variant="success">Publicerad</Badge> : <Badge variant="default">Utkast</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(a.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/kunskapsbank/${a.id}/redigera`}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="h-3 w-3" /> Redigera
                      </Link>
                      <form action={async () => { "use server"; await toggleArticlePublished(a.id, !a.published); }}>
                        <button type="submit"
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            a.published ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}>
                          {a.published ? "Avpublicera" : "Publicera"}
                        </button>
                      </form>
                      <DeleteButton action={async () => { "use server"; await deleteArticle(a.id); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Inga artiklar hittades.
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
