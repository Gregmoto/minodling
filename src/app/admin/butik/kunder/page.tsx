export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Kunder | Butik | Admin" };

export default async function AdminKunderPage() {
  await requireAdmin();

  const customers = await prisma.shopOrder.groupBy({
    by: ["email", "firstName", "lastName"],
    _count: { id: true },
    _sum: { total: true },
    orderBy: { _sum: { total: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kunder</h1>
        <p className="text-gray-500 text-sm mt-1">{customers.length} unika kunder</p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-post</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Antal ordrar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total spenderat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3">{c._count.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatPrice(c._sum.total ?? 0)}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-400">Inga kunder ännu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
