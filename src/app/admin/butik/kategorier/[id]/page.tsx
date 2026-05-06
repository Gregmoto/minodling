export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { CategoryEditForm } from "./CategoryEditForm";

export const metadata: Metadata = { title: "Redigera kategori | Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditKategoriPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const category = await prisma.shopCategory.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/butik/kategorier"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Tillbaka till kategorier
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Redigera kategori</h1>
        <p className="text-sm text-gray-500 mt-1">{category.name}</p>
      </div>

      <Card padding="md">
        <CategoryEditForm category={category} />
      </Card>
    </div>
  );
}
