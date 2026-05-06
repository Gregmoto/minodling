export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCategory } from "@/app/admin/butik/actions";
import { CategoryCreateForm } from "./CategoryCreateForm";

export const metadata: Metadata = { title: "Kategorier | Butik | Admin" };

export default async function AdminKategorierPage() {
  await requireAdmin();

  const categories = await prisma.shopCategory.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kategorier</h1>
        <p className="text-gray-500 text-sm mt-1">{categories.length} kategorier</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Namn</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Produkter</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ordning</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{cat.slug}</td>
                      <td className="px-4 py-3">{cat._count.products}</td>
                      <td className="px-4 py-3">{cat.sortOrder}</td>
                      <td className="px-4 py-3">
                        <Badge variant={cat.isActive ? "success" : "danger"}>
                          {cat.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DeleteButton
                          action={async () => {
                            "use server";
                            await deleteCategory(cat.id);
                          }}
                          confirmText={`Är du säker på att du vill radera "${cat.name}"?`}
                        />
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400">Inga kategorier.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <CategoryCreateForm />
        </div>
      </div>
    </div>
  );
}
