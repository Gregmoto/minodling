export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Edit, Power } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate, formatPrice } from "@/lib/utils";
import { deleteDiscount, toggleDiscount } from "@/app/admin/butik/actions";
import { DiscountCreateForm } from "./DiscountCreateForm";

export const metadata: Metadata = { title: "Rabattkoder | Butik | Admin" };

export default async function AdminRabattkodePage() {
  await requireAdmin();

  const discounts = await prisma.shopDiscountCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rabattkoder</h1>
        <p className="text-gray-500 text-sm mt-1">{discounts.length} rabattkoder</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kod</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Beskrivning</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Värde</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Användning</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Giltig fr.o.m.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Giltig t.o.m.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{d.code}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                        {d.description ?? <span className="text-gray-300">–</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{d.discountType === "percent" ? "Procent" : "Fast"}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {d.discountType === "percent" ? `${d.discountValue}%` : formatPrice(d.discountValue)}
                      </td>
                      <td className="px-4 py-3">
                        {d.usedCount}{d.maxUses !== null ? `/${d.maxUses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {d.startsAt ? formatDate(d.startsAt) : "–"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {d.endsAt ? formatDate(d.endsAt) : "–"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={d.isActive ? "success" : "danger"}>
                          {d.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Redigera */}
                          <Link
                            href={`/admin/butik/rabattkoder/${d.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Redigera"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>

                          {/* Aktivera / Inaktivera */}
                          <form
                            action={async () => {
                              "use server";
                              await toggleDiscount(d.id, !d.isActive);
                            }}
                          >
                            <button
                              type="submit"
                              title={d.isActive ? "Inaktivera" : "Aktivera"}
                              className={`inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                                d.isActive
                                  ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                                  : "text-green-600 border-green-200 hover:bg-green-50"
                              }`}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                          </form>

                          {/* Ta bort */}
                          <DeleteButton
                            action={async () => {
                              "use server";
                              await deleteDiscount(d.id);
                            }}
                            confirmText={`Ta bort rabattkod "${d.code}"?`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {discounts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-gray-400">Inga rabattkoder.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <DiscountCreateForm />
        </div>
      </div>
    </div>
  );
}
