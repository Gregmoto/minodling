export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Megaphone, Plus, Eye, MousePointerClick } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Annonser | Admin" };

const placementLabels: Record<string, string> = {
  header:  "Sidhuvud",
  sidebar: "Sidopanel",
  feed:    "Flöde",
  footer:  "Sidfot",
};

export default async function AdminAdsPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annonser & banners</h1>
          <p className="text-gray-500 text-sm mt-1">{banners.length} konfigurerade</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Ny annons
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50" padding="md">
        <div className="flex items-start gap-3">
          <Megaphone className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">Annonssystem förberett</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Annonser och banners är schemalagda för aktivering. Konfigurera placeringar,
              tidsbegränsning och målgrupper (gratis/premium).
            </p>
          </div>
        </div>
      </Card>

      {banners.length === 0 ? (
        <Card className="text-center py-16">
          <Megaphone className="h-10 w-10 text-sage-300 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">Inga annonser konfigurerade ännu</p>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Skapa första annonsen
          </Button>
        </Card>
      ) : (
        <Card padding="none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sage-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Titel</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Placering</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Visningar</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Klick</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-sage-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{banner.title}</td>
                  <td className="px-5 py-3">
                    <Badge variant="default" size="sm">
                      {placementLabels[banner.placement] ?? banner.placement}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {banner.impressionsCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" /> {banner.clicksCount}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {banner.isActive ? (
                      <Badge variant="success" size="sm">Aktiv</Badge>
                    ) : (
                      <Badge variant="default" size="sm">Inaktiv</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
