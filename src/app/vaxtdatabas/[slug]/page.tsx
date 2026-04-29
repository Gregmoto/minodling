export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Sun, Droplets, Layers, Sprout, CalendarDays, Leaf } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { plantMetadata, plantSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [plant, settings] = await Promise.all([
    prisma.plant.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!plant) return { title: "Växt hittades inte" };
  return plantMetadata(plant, settings, `/vaxtdatabas/${slug}`);
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

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-sage-500">{icon}</span>
      <div>
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-gray-800">{value}</dd>
      </div>
    </div>
  );
}

export default async function PlantDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [plant, settings, profile] = await Promise.all([
    prisma.plant.findUnique({ where: { slug } }),
    getSettings(),
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

  if (!plant) notFound();

  const navUser = profile
    ? {
        id: profile.id,
        username: profile.username,
        displayName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
      }
    : null;

  const pageUrl = `${settings.seoCanonical}/vaxtdatabas/${slug}`;
  const schema = plantSchema(plant, pageUrl, settings.siteName);

  const growingInfo: { icon: React.ReactNode; label: string; value: string }[] =
    [
      plant.sowingPeriod && {
        icon: <CalendarDays className="h-4 w-4" />,
        label: "Såningstid",
        value: plant.sowingPeriod,
      },
      plant.plantingPeriod && {
        icon: <Sprout className="h-4 w-4" />,
        label: "Planteringstid",
        value: plant.plantingPeriod,
      },
      plant.harvestPeriod && {
        icon: <Leaf className="h-4 w-4" />,
        label: "Skördetid",
        value: plant.harvestPeriod,
      },
      plant.sunRequirement && {
        icon: <Sun className="h-4 w-4" />,
        label: "Solbehov",
        value: plant.sunRequirement,
      },
      plant.wateringNeeds && {
        icon: <Droplets className="h-4 w-4" />,
        label: "Vattenbehov",
        value: plant.wateringNeeds,
      },
      plant.soilType && {
        icon: <Layers className="h-4 w-4" />,
        label: "Jordtyp",
        value: plant.soilType,
      },
    ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={schema} />
      <Navbar user={navUser} />

      <main className="flex-1">
        {/* Hero image */}
        {plant.imageUrl ? (
          <div className="relative h-64 w-full sm:h-80 lg:h-96 bg-sage-100">
            <Image
              src={plant.imageUrl}
              alt={plant.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6">
              <Breadcrumbs
                items={[
                  { name: "Växtdatabas", href: "/vaxtdatabas" },
                  { name: plant.name, href: `/vaxtdatabas/${slug}` },
                ]}
                seoCanonical={settings.seoCanonical}
                className="text-white/80 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white mb-3"
              />
              <div className="flex items-end gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl drop-shadow">
                    {plant.name}
                  </h1>
                  {plant.latinName && (
                    <p className="mt-1 text-white/75 italic text-sm">
                      {plant.latinName}
                    </p>
                  )}
                </div>
                {plant.difficultyLevel && (
                  <Badge
                    variant={difficultyVariant(plant.difficultyLevel)}
                    size="md"
                    className="ml-auto shrink-0"
                  >
                    {plant.difficultyLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No image – plain header */
          <section className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Breadcrumbs
                items={[
                  { name: "Växtdatabas", href: "/vaxtdatabas" },
                  { name: plant.name, href: `/vaxtdatabas/${slug}` },
                ]}
                seoCanonical={settings.seoCanonical}
                className="mb-4"
              />
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-100">
                  <Sprout className="h-8 w-8 text-sage-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    {plant.name}
                  </h1>
                  {plant.latinName && (
                    <p className="mt-1 text-gray-500 italic text-sm">
                      {plant.latinName}
                    </p>
                  )}
                </div>
                {plant.difficultyLevel && (
                  <Badge
                    variant={difficultyVariant(plant.difficultyLevel)}
                    size="md"
                    className="ml-auto shrink-0"
                  >
                    {plant.difficultyLevel}
                  </Badge>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <div className="bg-cream-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Description */}
              <div className="lg:col-span-2 space-y-6">
                {plant.description && (
                  <Card padding="lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Om {plant.name}
                    </h2>
                    <div
                      className="prose prose-sm prose-sage max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: plant.description }}
                    />
                  </Card>
                )}

                {!plant.description && (
                  <Card padding="lg">
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Sprout className="h-10 w-10 text-sage-200 mb-3" />
                      <p className="text-gray-500 text-sm">
                        Odlingsguide för {plant.name} är under uppbyggnad.
                      </p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar – growing info */}
              <div className="space-y-5">
                {growingInfo.length > 0 && (
                  <Card padding="lg">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">
                      Odlingsfakta
                    </h2>
                    <dl className="space-y-4">
                      {growingInfo.map((row) => (
                        <InfoRow
                          key={row.label}
                          icon={row.icon}
                          label={row.label}
                          value={row.value}
                        />
                      ))}
                    </dl>
                  </Card>
                )}

                {/* Back link */}
                <a
                  href="/vaxtdatabas"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
                >
                  ← Tillbaka till växtdatabasen
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
