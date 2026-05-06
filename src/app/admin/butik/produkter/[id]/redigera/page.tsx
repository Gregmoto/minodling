export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProductForm } from "../../ProductForm";

export const metadata: Metadata = { title: "Redigera produkt | Butik | Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RedigeraProduktPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.shopProduct.findUnique({ where: { id } }),
    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Redigera produkt</h1>
        <p className="text-gray-500 text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
