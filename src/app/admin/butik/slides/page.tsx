export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { SlidesManager } from "./SlidesManager";

export const metadata: Metadata = { title: "Slides | Butik | Admin" };

export default async function AdminSlidesPage() {
  await requireAdmin();

  const slides = await prisma.shopSlide.findMany({
    orderBy: { sortOrder: "asc" },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hero-slides</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hanterar slides i butikens hero-slider. Visas i sorteringsordning.
        </p>
      </div>
      <SlidesManager slides={slides} />
    </div>
  );
}
