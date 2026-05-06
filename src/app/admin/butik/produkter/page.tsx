export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "@/app/admin/butik/actions";

export const metadata: Metadata = { title: "Produkter | Butik | Admin" };

export default async function AdminProdukterPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const products = await prisma.shopProduct.findMany({
    where: params.search
      ? { name: { contains: params.search, mode: "insensitive" } }
      : {},
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produkter</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produkter totalt</p>
        </div>
        <Link
          href="/admin/butik/produkter/ny"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ny produkt
        </Link>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Sök produkt..."
          className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
        <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
          Sök
        </button>
        {params.search && (
          <Link href="/admin/butik/produkter" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pris</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Lager</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.category ? (
                      <span className="text-xs font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.stockQuantity > 0 ? "success" : "danger"}>
                      {product.stockQuantity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {product.isActive ? (
                        <Badge variant="success">Aktiv</Badge>
                      ) : (
                        <Badge variant="danger">Inaktiv</Badge>
                      )}
                      {product.isFeatured && <Badge variant="premium">Utvald</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/butik/produkter/${product.id}/redigera`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Redigera
                      </Link>
                      <DeleteButton
                        action={async () => {
                          "use server";
                          await deleteProduct(product.id);
                        }}
                        confirmText={`Är du säker på att du vill radera "${product.name}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Inga produkter hittades.
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
