export const revalidate = 60;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Sun, Droplets, Layers, Sprout, CalendarDays, Leaf,
  Flower2, Pencil,
} from "lucide-react";
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
import { PlantDetailTabs } from "@/components/plants/PlantDetailTabs";
import { PlantSidebarStatus } from "@/components/plants/PlantSidebarStatus";

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

function difficultyVariant(level?: string | null): "success" | "warning" | "danger" | "default" {
  if (!level) return "default";
  if (level === "easy")   return "success";
  if (level === "medium") return "warning";
  if (level === "hard")   return "danger";
  return "default";
}

function difficultyLabel(level?: string | null) {
  if (level === "easy")   return "Lätt att odla";
  if (level === "medium") return "Medelnivå";
  if (level === "hard")   return "Kräver erfarenhet";
  return level ?? "";
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 text-green-500 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
        <dd className="mt-0.5 text-sm text-gray-800 whitespace-pre-line">{value}</dd>
      </div>
    </div>
  );
}

function NoteSection({ title, emoji, content }: { title: string; emoji: string; content: string }) {
  return (
    <Card padding="lg">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
        <span>{emoji}</span>{title}
      </h2>
      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
    </Card>
  );
}

export default async function PlantDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [plant, settings, profile] = await Promise.all([
    prisma.plant.findUnique({
      where: { slug },
      include: {
        tips: {
          where: { status: "published" },
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { username: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    }),
    getSettings(),
    user
      ? prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
        })
      : null,
  ]);

  if (!plant) notFound();

  // Kolla om användaren redan odlar denna växt
  const isGrowing = profile
    ? (await prisma.gardenDiary.count({
        where: { userId: profile.id, plantId: plant.id, status: "growing" },
      })) > 0
    : false;

  // Fetch related guides and glossary terms
  const [relatedGuides, relatedTerms] = await Promise.all([
    prisma.guide.findMany({
      where: {
        published: true,
        OR: [
          { title:   { contains: plant.name, mode: "insensitive" } },
          { content: { contains: plant.name, mode: "insensitive" } },
        ],
      },
      select: { slug: true, title: true },
      take: 3,
    }).catch(() => []),
    prisma.glossaryTerm.findMany({
      where: {
        OR: [
          { term:            { contains: plant.name, mode: "insensitive" } },
          { fullDescription: { contains: plant.name, mode: "insensitive" } },
        ],
      },
      select: { slug: true, term: true },
      take: 4,
    }).catch(() => []),
  ]);

  const navUser = profile
    ? { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role }
    : null;

  const pageUrl = `${settings.seoCanonical}/vaxtdatabas/${slug}`;
  const schema  = plantSchema(plant, pageUrl, settings.siteName);
  const isAdmin = profile && ["admin", "moderator"].includes(profile.role);

  const growingInfo: { icon: React.ReactNode; label: string; value: string }[] = [
    plant.sowingPeriod    && { icon: <CalendarDays className="h-4 w-4" />, label: "Såningstid",    value: plant.sowingPeriod },
    plant.plantingPeriod  && { icon: <Sprout       className="h-4 w-4" />, label: "Planteringstid", value: plant.plantingPeriod },
    plant.harvestPeriod   && { icon: <Leaf         className="h-4 w-4" />, label: "Skördetid",      value: plant.harvestPeriod },
    plant.sunRequirement  && { icon: <Sun          className="h-4 w-4" />, label: "Solbehov",       value: plant.sunRequirement },
    plant.wateringNeeds   && { icon: <Droplets     className="h-4 w-4" />, label: "Vattenbehov",    value: plant.wateringNeeds },
    plant.soilType        && { icon: <Layers       className="h-4 w-4" />, label: "Jordtyp",        value: plant.soilType },
    plant.fertilizerNeeds && { icon: <Flower2      className="h-4 w-4" />, label: "Gödsling",       value: plant.fertilizerNeeds },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={schema} />
      <Navbar user={navUser} />

      <main className="flex-1">

        {/* ── Hero ── */}
        {plant.imageUrl ? (
          <div className="relative h-64 w-full sm:h-80 lg:h-[420px] bg-green-50">
            <Image
              src={plant.imageUrl}
              alt={plant.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 container-main pb-6">
              <Breadcrumbs
                items={[
                  { name: "Växtdatabas", href: "/vaxtdatabas" },
                  { name: plant.name,    href: `/vaxtdatabas/${slug}` },
                ]}
                seoCanonical={settings.seoCanonical}
                className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white mb-3"
              />
              <div className="flex items-end gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl drop-shadow">
                    {plant.name}
                  </h1>
                  {plant.latinName && (
                    <p className="mt-1 text-white/70 italic text-sm">{plant.latinName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {plant.category && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                      {plant.category}
                    </span>
                  )}
                  {plant.difficultyLevel && (
                    <Badge variant={difficultyVariant(plant.difficultyLevel)} size="md">
                      {difficultyLabel(plant.difficultyLevel)}
                    </Badge>
                  )}
                  {isAdmin && (
                    <Link
                      href={`/admin/vaxter/${plant.id}/redigera`}
                      className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Redigera
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <section className="bg-gradient-to-b from-green-50 to-cream-50 border-b border-green-100 py-10">
            <div className="container-main">
              <Breadcrumbs
                items={[
                  { name: "Växtdatabas", href: "/vaxtdatabas" },
                  { name: plant.name,    href: `/vaxtdatabas/${slug}` },
                ]}
                seoCanonical={settings.seoCanonical}
                className="mb-4"
              />
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 shrink-0">
                  <Sprout className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{plant.name}</h1>
                  {plant.latinName && (
                    <p className="mt-1 text-gray-500 italic text-sm">{plant.latinName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {plant.category && <Badge variant="outline">{plant.category}</Badge>}
                  {plant.difficultyLevel && (
                    <Badge variant={difficultyVariant(plant.difficultyLevel)}>
                      {difficultyLabel(plant.difficultyLevel)}
                    </Badge>
                  )}
                  {isAdmin && (
                    <Link
                      href={`/admin/vaxter/${plant.id}/redigera`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Redigera
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Innehåll ── */}
        <div className="bg-cream-50 min-h-screen">
          <div className="container-main py-8">
            <div className="grid gap-8 lg:grid-cols-3">

              {/* ── Vänster: flik-innehåll ── */}
              <div className="lg:col-span-2">
                <PlantDetailTabs
                  plant={{
                    id:              plant.id,
                    name:            plant.name,
                    slug:            plant.slug,
                    description:     plant.description,
                    commonProblems:  plant.commonProblems,
                    difficultyLevel: plant.difficultyLevel,
                    category:        plant.category,
                    // Fritext
                    locationNotes:   plant.locationNotes,
                    soilPreparation: plant.soilPreparation,
                    // Strukturerad kalenderdata – null tills vidare
                    indoorsStart:    null,
                    harvestWindow:   null,
                    // Plats (strukturerat) – null tills vidare
                    hardinessZone:   null,
                    temperature:     null,
                    sunlight:        [],
                    goodNeighbors:   [],
                    badNeighbors:    [],
                    // Jord (strukturerat) – null tills vidare
                    ph:              null,
                    soilTypes:       [],
                    drainage:        null,
                    nutrientLevel:   null,
                    soilNotes:       null,
                    // Tillväxt – default-faser visas automatiskt
                    growthPhases:    undefined,
                    // How-tos – default-faser visas automatiskt
                    howToPhases:     undefined,
                    // FAQ – döljs om tom
                    faqItems:        undefined,
                    // Näringsvärden – döljs om tom
                    benefitsText:    null,
                    nutrition:       undefined,
                    recipes:         undefined,
                    benefitsTags:    undefined,
                  }}
                  tips={plant.tips}
                  relatedGuides={relatedGuides}
                  relatedTerms={relatedTerms}
                  isLoggedIn={!!profile}
                  initialGrowing={isGrowing}
                />
              </div>

              {/* ── Höger sidebar ── */}
              <div className="space-y-5 lg:pt-[52px]">

                {/* Svårighetsgrad + odlingsstatus + knappar */}
                <PlantSidebarStatus
                  difficultyLevel={plant.difficultyLevel}
                  initialGrowing={isGrowing}
                />

                {/* Kom igång – OVANFÖR Odlingsfakta */}
                {(plant.sowingPeriod || plant.plantingPeriod || plant.harvestPeriod || plant.sunRequirement || plant.wateringNeeds) && (
                  <Card padding="lg" className="bg-green-50 border-green-200">
                    <h2 className="text-sm font-bold text-green-900 mb-3">Kom igång</h2>
                    <ul className="space-y-2.5 text-sm text-green-800">
                      {plant.sowingPeriod && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">🌱</span>
                          <span>Så inomhus: <strong>{plant.sowingPeriod}</strong></span>
                        </li>
                      )}
                      {plant.plantingPeriod && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">🪴</span>
                          <span>Plantera ut: <strong>{plant.plantingPeriod}</strong></span>
                        </li>
                      )}
                      {plant.harvestPeriod && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">🌾</span>
                          <span>Skörd: <strong>{plant.harvestPeriod}</strong></span>
                        </li>
                      )}
                      {plant.sunRequirement && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">☀️</span>
                          <span>{plant.sunRequirement}</span>
                        </li>
                      )}
                      {plant.wateringNeeds && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">💧</span>
                          <span>{plant.wateringNeeds}</span>
                        </li>
                      )}
                    </ul>
                  </Card>
                )}

                {/* Odlingsfakta */}
                {growingInfo.length > 0 && (
                  <Card padding="lg">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Odlingsfakta</h2>
                    <dl>
                      {growingInfo.map((row) => (
                        <InfoRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
                      ))}
                    </dl>
                  </Card>
                )}

                {/* Lämplig plats */}
                {plant.locationNotes && (
                  <NoteSection title="Lämplig plats" emoji="📍" content={plant.locationNotes} />
                )}

                {/* Jordförberedelse */}
                {plant.soilPreparation && (
                  <NoteSection title="Jordförberedelse" emoji="🪱" content={plant.soilPreparation} />
                )}

                {/* Navigeringslänkar */}
                <div className="space-y-2">
                  <Link
                    href="/vaxtdatabas"
                    className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
                  >
                    ← Tillbaka till växtdatabasen
                  </Link>
                  {plant.category && (
                    <Link
                      href={`/vaxtdatabas?kategori=${encodeURIComponent(plant.category)}`}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 hover:underline"
                    >
                      → Fler {plant.category.toLowerCase()}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
