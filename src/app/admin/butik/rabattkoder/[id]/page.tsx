export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { DiscountEditForm } from "./DiscountEditForm";

export const metadata: Metadata = { title: "Redigera rabattkod | Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRabattkodPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const discount = await prisma.shopDiscountCode.findUnique({ where: { id } });
  if (!discount) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/butik/rabattkoder"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Tillbaka till rabattkoder
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Redigera rabattkod</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{discount.code}</p>
      </div>

      <Card padding="md">
        <DiscountEditForm discount={discount} />
      </Card>
    </div>
  );
}
