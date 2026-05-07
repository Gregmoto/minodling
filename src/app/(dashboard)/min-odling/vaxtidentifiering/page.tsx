import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Scan, ArrowLeft, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mina växtidentifieringar" };

interface IdentResult {
  latinName:   string;
  commonName?: string | null;
  probability: number;
  imageUrl?:   string | null;
}

export default async function MinaVaxtidentifieringarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) redirect("/auth/login");

  const identifications = await prisma.plantIdentification.findMany({
    where:   { userId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { selectedPlant: { select: { name: true, slug: true } } },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/min-odling"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mina växtidentifieringar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {identifications.length} sparade identifieringar
          </p>
        </div>
      </div>

      {/* CTA om inga */}
      {identifications.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto mb-5">
            <Scan className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">Inga identifieringar än</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Fotografera en växt så identifierar vår AI vad den är och ger dig skötselråd.
          </p>
          <Link
            href="/vaxtidentifiering"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <Scan className="h-4 w-4" />
            Identifiera en växt
          </Link>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <Link
              href="/vaxtidentifiering"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <Scan className="h-4 w-4" />
              Ny identifiering
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {identifications.map((item) => {
              const results = (item.resultsJson as IdentResult[] | null) ?? [];
              const top     = results[0];
              const others  = results.slice(1);

              return (
                <Card key={item.id} padding="none" className="overflow-hidden">
                  {/* Bild */}
                  <div className="relative h-40 bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={top?.commonName ?? top?.latinName ?? "Växt"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Scan className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                    {/* Provider-badge */}
                    <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.apiProvider === "plant.id"
                        ? "bg-blue-600 text-white"
                        : item.apiProvider === "plantnet"
                        ? "bg-green-600 text-white"
                        : "bg-gray-500 text-white"
                    }`}>
                      {item.apiProvider === "plant.id" ? "Plant.id" : item.apiProvider === "plantnet" ? "PlantNet" : "Demo"}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Toppresultat */}
                    {top ? (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {top.commonName ?? top.latinName}
                            </p>
                            {top.commonName && (
                              <p className="text-xs text-gray-400 italic truncate">{top.latinName}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-xs font-bold text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                            {top.probability}%
                          </span>
                        </div>

                        {/* Övriga förslag */}
                        {others.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {others.map((r, i) => (
                              <div key={i} className="flex items-center justify-between text-xs text-gray-500">
                                <span className="truncate italic">{r.latinName}</span>
                                <span className="shrink-0 ml-2 text-gray-400">{r.probability}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Inga resultat</p>
                    )}

                    {/* Vald / matchad växt */}
                    {item.selectedPlant && (
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-400 mb-1">Matchad växt i databasen</p>
                        <Link
                          href={`/vaxtdatabas/${item.selectedPlant.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                        >
                          {item.selectedPlant.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}

                    {/* Datum */}
                    <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
