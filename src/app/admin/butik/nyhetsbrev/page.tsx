export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Nyhetsbrev | Butik | Admin" };

export default async function AdminNyhetsbrevPage() {
  await requireAdmin();

  const [subscribers, activeCount] = await Promise.all([
    prisma.shopNewsletter.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.shopNewsletter.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nyhetsbrev</h1>
        <p className="text-gray-500 text-sm mt-1">
          {subscribers.length} prenumeranter ({activeCount} aktiva)
        </p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-post</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Källa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3 text-gray-600">{sub.firstName ?? "–"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full">
                      {sub.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sub.isActive ? "success" : "danger"}>
                      {sub.isActive ? "Aktiv" : "Avregistrerad"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(sub.createdAt)}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Inga prenumeranter ännu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
