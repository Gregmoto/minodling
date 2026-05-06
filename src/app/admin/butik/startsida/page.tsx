export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Link2, LayoutDashboard } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { HomeLinksManager } from "./HomeLinksManager";
import { HomeSectionsManager } from "./HomeSectionsManager";

export const metadata: Metadata = {
  title: "Startsida – Butik | Admin",
};

export default async function AdminButikStartsidaPage() {
  await requireAdmin();

  const [homeLinks, homeSections, categories, plants] = await Promise.all([
    prisma.shopHomeLink.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.shopHomeSection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        plant: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.plant.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/butik"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Butik – Översikt
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Startsida – Butik</h1>
            <p className="text-gray-500 text-sm">
              Hantera snabblänkspillrar och kampanjsektioner på /butik
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Snabblänkar – "Populärt just nu"
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Pillerlänkar som visas under hero-slidern på butikens startsida.
          Bra för att lyfta säsongsprodukter, kampanjer eller kategorier.
        </p>
        <HomeLinksManager links={homeLinks} />
      </section>

      {/* Home Sections */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="h-4 w-4 text-violet-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Startsidans sektioner
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Kampanjbanners, dubbla kort och växtbaserade produktkarusellersom visas
          mitt på butikens startsida (efter kategorigalleri).
        </p>
        <HomeSectionsManager
          sections={homeSections}
          categories={categories}
          plants={plants}
        />
      </section>
    </div>
  );
}
