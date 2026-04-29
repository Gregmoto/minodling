export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, Sprout } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Växtdatabas – Odlingsguider",
  description:
    "Utforska vår växtdatabas med odlingsguider för svenska köksväxter, blommor och örter. Hitta såningstider, skötselråd och tips för varje växt.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

function difficultyVariant(
  level?: string | null
): "success" | "warning" | "danger" | "default" {
  if (!level) return "default";
  const l = level.toLowerCase();
  if (l === "lätt" || l === "easy") return "success";
  if (l === "medel" || l === "medium") return "warning";
  if (l === "svår" || l === "hard") return "danger";
  return "default";
}

export default async function VaxtdatabasePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [plants, profile] = await Promise.all([
    prisma.plant.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { latinName: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        latinName: true,
        imageUrl: true,
        difficultyLevel: true,
        sowingPeriod: true,
      },
    }),
    user
      ? prisma.profile.findUnique({
          where: { userId: user.id },
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        })
      : null,
  ]);

  const navUser = profile
    ? {
        id: profile.id,
        username: profile.username,
        displayName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={[{ name: "Växtdatabas", href: "/vaxtdatabas" }]}
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Växtdatabas
            </h1>
            <p className="mt-2 text-gray-600 max-w-xl">
              Odlingsguider för svenska köksväxter, blommor och örter – med
              såningstider, skötselråd och praktiska tips.
            </p>

            {/* Search */}
            <form method="GET" className="mt-6 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Sök på växt eller latinskt namn…"
                  className="w-full rounded-xl border border-sage-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </form>
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {q && (
            <p className="mb-6 text-sm text-gray-500">
              {plants.length > 0
                ? `${plants.length} växter hittades för "${q}"`
                : `Inga växter hittades för "${q}"`}
            </p>
          )}

          {plants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Sprout className="h-14 w-14 text-sage-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">
                {q
                  ? "Inga växter matchade din sökning"
                  : "Databasen byggs upp – kom snart!"}
              </h2>
              <p className="mt-2 text-gray-500 max-w-sm">
                {q
                  ? "Prova ett annat sökord eller bläddra bland alla växter."
                  : "Vi arbetar med att fylla databasen med odlingsguider för svenska växter."}
              </p>
              {q && (
                <Link
                  href="/vaxtdatabas"
                  className="mt-4 text-sm font-medium text-green-700 hover:underline"
                >
                  Visa alla växter
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plants.map((plant) => (
                <Link
                  key={plant.id}
                  href={`/vaxtdatabas/${plant.slug}`}
                  className="group block"
                >
                  <Card hover padding="none" className="overflow-hidden h-full">
                    {/* Image */}
                    <div className="relative h-44 w-full bg-sage-50">
                      {plant.imageUrl ? (
                        <Image
                          src={plant.imageUrl}
                          alt={plant.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Sprout className="h-12 w-12 text-sage-200" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-semibold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
                          {plant.name}
                        </h2>
                        {plant.difficultyLevel && (
                          <Badge variant={difficultyVariant(plant.difficultyLevel)}>
                            {plant.difficultyLevel}
                          </Badge>
                        )}
                      </div>

                      {plant.latinName && (
                        <p className="text-xs text-gray-400 italic">
                          {plant.latinName}
                        </p>
                      )}

                      {plant.sowingPeriod && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Sås:</span>{" "}
                          {plant.sowingPeriod}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
