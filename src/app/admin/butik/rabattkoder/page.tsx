export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate, formatPrice } from "@/lib/utils";
import { deleteDiscount } from "@/app/admin/butik/actions";
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
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Värde</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Användning</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Giltig t.o.m.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{d.code}</td>
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
                        {d.endsAt ? formatDate(d.endsAt) : "–"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={d.isActive ? "success" : "danger"}>
                          {d.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DeleteButton
                          action={async () => {
                            "use server";
                            await deleteDiscount(d.id);
                          }}
                          confirmText={`Ta bort rabattkod "${d.code}"?`}
                        />
                      </td>
                    </tr>
                  ))}
                  {discounts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Inga rabattkoder.</td>
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
