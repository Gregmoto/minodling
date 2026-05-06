export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { ShopMenuManager } from "./ShopMenuManager";

export const metadata: Metadata = { title: "Butiksmeny | Admin" };

export default async function ShopMenuPage() {
  await requireAdmin();

  const [navItems, categories] = await Promise.all([
    prisma.shopNavItem.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, label: true, href: true,
        sortOrder: true, isActive: true, categoryId: true,
        category: { select: { name: true, slug: true } },
      },
    }).catch(() => []),

    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Butiksmeny</h1>
          <p className="text-gray-500 text-sm mt-1">
            Hantera kategori-länkarna som visas i butikens navbar. Dra för att ändra ordning.
          </p>
        </div>
        <a
          href="/butik"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Förhandsgranska
        </a>
      </div>

      <Card padding="md">
        <ShopMenuManager initialItems={navItems} categories={categories} />
      </Card>

      <Card padding="md">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Tips</h2>
        <ul className="text-xs text-gray-500 space-y-1.5 leading-relaxed">
          <li>• Dra i ☰ för att ändra ordning – sparas direkt</li>
          <li>• Länk till kategori: <code className="bg-gray-100 px-1 rounded">/butik/kategori/din-slug</code></li>
          <li>• Länk till alla produkter: <code className="bg-gray-100 px-1 rounded">/butik/produkter</code></li>
          <li>• Koppla till en kategori så hanteras sluggen automatiskt</li>
          <li>• Inaktiva objekt visas inte i butikens navbar</li>
        </ul>
      </Card>
    </div>
  );
}
