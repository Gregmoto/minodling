export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Edit2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteGlossaryTerm, toggleGlossaryTermPublished } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Ordlista | Admin" };

export default async function OrdlistaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; published?: string }>;
}) {
  const params = await searchParams;
  const activeFilter = params.published ?? "all";

  const terms = await prisma.glossaryTerm.findMany({
    where: {
      AND: [
        params.search ? { term: { contains: params.search, mode: "insensitive" } } : {},
        params.published !== undefined ? { published: params.published === "true" } : {},
      ],
    },
    orderBy: { term: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Odlingsordlista</h1>
          <p className="text-gray-500 text-sm mt-1">{terms.length} termer</p>
        </div>
        <Link href="/admin/ordlista/ny"
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" /> Ny term
        </Link>
      </div>

      {/* Sök + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/ordlista" className="flex gap-2">
          <input
            type="text" name="search"
            defaultValue={params.search ?? ""}
            placeholder="Sök term..."
            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-300 w-56"
          />
          {params.published && <input type="hidden" name="published" value={params.published} />}
          <button type="submit"
            className="px-3 py-1.5 text-sm font-medium bg-sage-600 text-white rounded-xl hover:bg-sage-700 transition-colors">
            Sök
          </button>
          {params.search && (
            <Link href="/admin/ordlista"
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              Rensa
            </Link>
          )}
        </form>

        <div className="flex gap-2">
          {[
            { value: "all",   label: "Alla" },
            { value: "true",  label: "Publicerade" },
            { value: "false", label: "Utkast" },
          ].map(({ value, label }) => (
            <Link key={value}
              href={value === "all" ? "/admin/ordlista" : `/admin/ordlista?published=${value}`}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                activeFilter === value ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Term</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kort beskrivning</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {terms.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{t.term}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs">
                    <span className="line-clamp-1">{t.shortDescription ?? "–"}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{t.category ?? "–"}</td>
                  <td className="px-4 py-3">
                    {t.published ? <Badge variant="success">Publicerad</Badge> : <Badge variant="default">Utkast</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/ordlista/${t.id}/redigera`}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="h-3 w-3" /> Redigera
                      </Link>
                      <form action={async () => { "use server"; await toggleGlossaryTermPublished(t.id, !t.published); }}>
                        <button type="submit"
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            t.published ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}>
                          {t.published ? "Avpublicera" : "Publicera"}
                        </button>
                      </form>
                      <DeleteButton action={async () => { "use server"; await deleteGlossaryTerm(t.id); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {terms.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Inga termer hittades.
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
