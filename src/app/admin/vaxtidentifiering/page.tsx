export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Växtidentifieringar | Admin" };

interface IdentResult {
  latinName:   string;
  commonName?: string | null;
  probability: number;
}

export default async function AdminVaxtidentifieringPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; q?: string }>;
}) {
  await requireAdmin();

  const { provider, q } = await searchParams;
  const search  = q?.trim() ?? "";
  const provFilter = provider && provider !== "all" ? provider : undefined;

  const [identifications, total] = await Promise.all([
    prisma.plantIdentification.findMany({
      where: {
        ...(provFilter ? { apiProvider: provFilter } : {}),
        ...(search
          ? {
              user: {
                OR: [
                  { username: { contains: search, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user:          { select: { username: true, id: true } },
        selectedPlant: { select: { name: true, slug: true } },
      },
    }),
    prisma.plantIdentification.count(),
  ]);

  const providerCounts = await prisma.plantIdentification.groupBy({
    by: ["apiProvider"],
    _count: { id: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Växtidentifieringar</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} identifieringar totalt
          </p>
        </div>
        <Link
          href="/admin/vaxtdiagnos"
          className="text-sm text-sage-600 hover:text-sage-800 font-medium"
        >
          → Visa växtdiagnoser
        </Link>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        {providerCounts.map((p) => (
          <span
            key={p.apiProvider}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
          >
            <span className="capitalize">{p.apiProvider}</span>
            <span className="text-gray-400">{p._count.id}</span>
          </span>
        ))}
      </div>

      {/* Filter */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Sök på användarnamn…"
          className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
        <select
          name="provider"
          defaultValue={provider ?? "all"}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        >
          <option value="all">Alla providers</option>
          <option value="plant.id">Plant.id</option>
          <option value="plantnet">PlantNet</option>
          <option value="mock">Demo</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700 transition-colors"
        >
          Filtrera
        </button>
        {(search || provider) && (
          <Link
            href="/admin/vaxtidentifiering"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Rensa
          </Link>
        )}
      </form>

      {/* Tabell */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Bild</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Toppresultat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Provider</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vald växt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {identifications.map((item) => {
                const results = (item.resultsJson as IdentResult[] | null) ?? [];
                const top = results[0];

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* Bild */}
                    <td className="px-4 py-3">
                      {item.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          –
                        </div>
                      )}
                    </td>

                    {/* Toppresultat */}
                    <td className="px-4 py-3">
                      {top ? (
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">
                            {top.commonName ?? top.latinName}
                          </p>
                          <p className="text-xs text-gray-400 italic truncate max-w-[180px]">
                            {top.latinName}
                          </p>
                          <p className="text-xs text-sage-600 mt-0.5">{top.probability}%</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">–</span>
                      )}
                    </td>

                    {/* Användare */}
                    <td className="px-4 py-3">
                      {item.user ? (
                        <Link
                          href={`/admin/anvandare/${item.user.id}`}
                          className="text-sage-700 hover:underline font-medium"
                        >
                          @{item.user.username}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">Anonym</span>
                      )}
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.apiProvider === "plant.id"
                          ? "bg-blue-50 text-blue-700"
                          : item.apiProvider === "plantnet"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.apiProvider}
                      </span>
                    </td>

                    {/* Vald växt */}
                    <td className="px-4 py-3">
                      {item.selectedPlant ? (
                        <Link
                          href={`/admin/vaxter/${item.selectedPlant.slug}`}
                          className="text-sage-700 hover:underline text-xs"
                        >
                          {item.selectedPlant.name}
                        </Link>
                      ) : (
                        <span className="text-gray-300 text-xs">–</span>
                      )}
                    </td>

                    {/* Datum */}
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                );
              })}

              {identifications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Inga identifieringar hittades.
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
