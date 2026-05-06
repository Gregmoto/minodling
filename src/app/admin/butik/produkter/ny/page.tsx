export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Ny produkt | Butik | Admin" };

export default async function NyProduktPage() {
  await requireAdmin();
  const [categories, plants] = await Promise.all([
    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }).catch(() => []),
    prisma.plant.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, latinName: true, imageUrl: true },
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ny produkt</h1>
        <p className="text-gray-500 text-sm mt-1">Fyll i produktuppgifter nedan</p>
      </div>
      <ProductForm categories={categories} plants={plants} existingLinks={[]} />
    </div>
  );
}
