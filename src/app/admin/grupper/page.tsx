export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteGroup } from "@/app/grupper/actions";

export const metadata: Metadata = { title: "Grupper | Admin" };

export default async function AdminGrupperPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params   = await searchParams;
  const kategori = params.kategori ?? "all";

  const groups = await prisma.group.findMany({
    where: kategori !== "all" ? { category: kategori } : {},
    orderBy: { members: { _count: "desc" } },
    take: 100,
    include: {
      creator: { select: { username: true } },
      _count:  { select: { members: true } },
    },
  });

  const total         = await prisma.group.count();
  const regionCount   = await prisma.group.count({ where: { category: "region" } });
  const interestCount = await prisma.group.count({ where: { category: "interest" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Odlargrupper</h1>
          <p className="text-gray-500 text-sm mt-1">{total} totalt</p>
        </div>
        <Link href="/grupper" target="_blank"
          className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 transition-colors">
          <ExternalLink className="h-4 w-4" /> Visa live
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "all",      label: `Alla (${total})` },
          { value: "region",   label: `📍 Region (${regionCount})` },
          { value: "interest", label: `🌱 Intresse (${interestCount})` },
        ].map(({ value, label }) => (
          <Link key={value}
            href={value === "all" ? "/admin/grupper" : `/admin/grupper?kategori=${value}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              kategori === value ? "bg-sage-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Synlighet</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plats</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Medlemmar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Skapare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link href={`/grupper/${g.slug}`} target="_blank" className="hover:text-green-700 transition-colors">
                      {g.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {g.category === "region"
                      ? <Badge variant="outline" size="sm">📍 Region</Badge>
                      : <Badge variant="outline" size="sm">🌱 Intresse</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {g.groupType === "public" ? "Öppen" : "Privat"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{g.location ?? "–"}</td>
                  <td className="px-4 py-3 text-gray-500 text-center">{g._count.members}</td>
                  <td className="px-4 py-3 text-gray-500">{g.creator.username}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(g.createdAt)}</td>
                  <td className="px-4 py-3">
                    <DeleteButton action={async () => { "use server"; await deleteGroup(g.id); }} />
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Inga grupper hittades.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
