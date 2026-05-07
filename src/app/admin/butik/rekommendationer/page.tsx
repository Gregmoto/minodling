export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Zap } from "lucide-react";
import prisma from "@/lib/prisma";
import { RecommendationManager } from "./RecommendationManager";

export const metadata: Metadata = { title: "Produktrekommendationer" };

export default async function RecommendationRulesPage() {
  const [rules, products, plants] = await Promise.all([
    prisma.shopProductRecommendationRule.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: {
        product: { select: { id: true, name: true, slug: true } },
        plant:   { select: { id: true, name: true } },
      },
    }).catch(() => []),
    prisma.shopProduct.findMany({
      where:   { isActive: true },
      select:  { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
    prisma.plant.findMany({
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Zap className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produktrekommendationer</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Koppla produkter till växter, symptom och problemtyper — visas automatiskt i diagnos och identifiering
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Aktiva regler",    value: rules.filter((r) => r.isActive).length },
          { label: "Inaktiva regler",  value: rules.filter((r) => !r.isActive).length },
          { label: "Produkter totalt", value: products.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <RecommendationManager
          rules={rules}
          products={products}
          plants={plants}
        />
      </div>
    </div>
  );
}
