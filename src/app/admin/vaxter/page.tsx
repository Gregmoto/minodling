export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deletePlant } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Växtdatabas | Admin" };

function difficultyBadge(level: string | null) {
  if (level === "easy")   return <Badge variant="success">Lätt</Badge>;
  if (level === "medium") return <Badge variant="warning">Medel</Badge>;
  if (level === "hard")   return <Badge variant="danger">Svår</Badge>;
  return <span className="text-gray-400">–</span>;
}

export default async function VaxterPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;

  const plants = await prisma.plant.findMany({
    where: params.search
      ? { name: { contains: params.search, mode: "insensitive" } }
      : {},
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Växtdatabas</h1>
          <p className="text-gray-500 text-sm mt-1">{plants.length} totalt</p>
        </div>
        <Link
          href="/admin/vaxter/ny"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-sage-600 text-white hover:bg-sage-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lägg till växt
        </Link>
      </div>

      {/* Sökformulär */}
      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Sök växt..."
          className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sök
        </button>
        {params.search && (
          <Link
            href="/admin/vaxter"
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Rensa
          </Link>
        )}
      </form>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Latinskt namn</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Svårighetsgrad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plants.map((plant) => (
                <tr key={plant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{plant.name}</td>
                  <td className="px-4 py-3">
                    {plant.latinName ? (
                      <span className="text-gray-400 italic">{plant.latinName}</span>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {plant.category ? (
                      <span className="text-xs font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full">
                        {plant.category}
                      </span>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{difficultyBadge(plant.difficultyLevel)}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {formatDate(plant.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/vaxter/${plant.id}/redigera`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Redigera
                      </Link>
                      <DeleteButton action={async () => { "use server"; await deletePlant(plant.id); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {plants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Inga växter hittades.
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
