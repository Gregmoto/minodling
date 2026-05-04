export const revalidate = 300;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import {
  Sun, Droplets, Layers, Sprout, CalendarDays, Leaf,
  Flower2, Pencil,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { plantMetadata, plantSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { NavbarWithAuth } from "@/components/layout/NavbarWithAuth";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlantDetailTabs } from "@/components/plants/PlantDetailTabs";
import { PlantSidebarAuth } from "@/components/plants/PlantSidebarAuth";
import { PlantSidebarStatus } from "@/components/plants/PlantSidebarStatus";
import { PlantTipFormServer } from "@/components/plants/PlantTipFormServer";
import { getRequestUser } from "@/lib/auth-cache";

// ── Cachade DB-anrop (5 min) ──────────────────────────────────────
const getPlant = unstable_cache(
  async (slug: string) =>
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
    }).catch(() => null),
  ["plant-detail"],
  { revalidate: 300, tags: ["plants"] },
);

const getPlantRelated = unstable_cache(
  async (plantName: string) =>
    Promise.all([
      prisma.guide.findMany({
        where: {
          published: true,
          OR: [
            { title:   { contains: plantName, mode: "insensitive" } },
            { content: { contains: plantName, mode: "insensitive" } },
          ],
        },
        select: { slug: true, title: true },
        take: 3,
      }).catch(() => []),
      prisma.glossaryTerm.findMany({
        where: {
          OR: [
            { term:            { contains: plantName, mode: "insensitive" } },
            { fullDescription: { contains: plantName, mode: "insensitive" } },
          ],
        },
        select: { slug: true, term: true },
        take: 4,
      }).catch(() => []),
    ]),
  ["plant-related"],
  { revalidate: 300, tags: ["plants"] },
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [plant, settings] = await Promise.all([getPlant(slug), getSettings()]);
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

// ── Admin-knapp (async, körs parallellt via Suspense) ─────────────
async function AdminEditButton({ plantId }: { plantId: string }) {
  const user = await getRequestUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });
  if (!profile || !["admin", "moderator"].includes(profile.role)) return null;
  return (
    <Link
      href={`/admin/vaxter/${plantId}/redigera`}
      className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
    >
      <Pencil className="h-3.5 w-3.5" /> Redigera
    </Link>
  );
}

async function AdminEditButtonInline({ plantId }: { plantId: string }) {
  const user = await getRequestUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });
  if (!profile || !["admin", "moderator"].includes(profile.role)) return null;
  return (
    <Link
      href={`/admin/vaxter/${plantId}/redigera`}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
    >
      <Pencil className="h-3.5 w-3.5" /> Redigera
    </Link>
  );
}


export default async function PlantDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // ── Snabbväg: bara cachade anrop blockerar initial render ─────────
  const [plant, settings] = await Promise.all([getPlant(slug), getSettings()]);
  if (!plant) notFound();

  const [relatedGuides, relatedTerms] = await getPlantRelated(plant.name);

  const pageUrl = `${settings.seoCanonical}/vaxtdatabas/${slug}`;
  const schema  = plantSchema(plant, pageUrl, settings.siteName);

  // ── Parser: fritext → kalenderperiod ────────────────────────────
  const MONTH_MAP: Record<string, number> = {
    jan:1, feb:2, mar:3, apr:4, maj:5, jun:6,
    jul:7, aug:8, sep:9, okt:10, nov:11, dec:12,
  };
  const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
  function parseMonthRange(text?: string | null) {
    if (!text) return null;
    const m = text.toLowerCase().match(
      /(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)[a-z]*\s*[–\-]\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)/,
    );
    if (!m) return null;
    const start = MONTH_MAP[m[1]];
    const end   = MONTH_MAP[m[2]];
    if (!start || !end) return null;
    return { startMonth: start, startDay: 1, endMonth: end, endDay: DAYS_IN_MONTH[end - 1] };
  }

  const indoorsStart   = parseMonthRange(plant.sowingPeriod);
  const plantingWindow = parseMonthRange(plant.plantingPeriod);
  const harvestWindow  = parseMonthRange(plant.harvestPeriod);

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

      {/* Navbar – auth körs parallellt, blockerar inte sidan */}
      <Suspense fallback={<div className="h-16 border-b border-gray-100 bg-white" />}>
        <NavbarWithAuth />
      </Suspense>

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
                  <Suspense fallback={null}>
                    <AdminEditButton plantId={plant.id} />
                  </Suspense>
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
                  <Suspense fallback={null}>
                    <AdminEditButtonInline plantId={plant.id} />
                  </Suspense>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Innehåll ── */}
        <div className="bg-cream-50 min-h-screen [overflow-x:clip]">
          <div className="container-main py-8">
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">

              {/* ── Höger sidebar ── */}
              <div className="space-y-4 lg:space-y-5 lg:col-start-3 lg:row-start-1 lg:pt-[52px]">

                {/* Auth-beroende status – laddar asynkront */}
                <Suspense fallback={
                  <PlantSidebarStatus difficultyLevel={plant.difficultyLevel} initialGrowing={false} />
                }>
                  <PlantSidebarAuth plantId={plant.id} difficultyLevel={plant.difficultyLevel} />
                </Suspense>

                {/* Kom igång */}
                {(plant.sowingPeriod || plant.plantingPeriod || plant.harvestPeriod || plant.sunRequirement || plant.wateringNeeds) && (
                  <Card padding="lg" className="bg-green-50 border-green-200">
                    <h2 className="text-sm font-bold text-green-900 mb-3">Kom igång</h2>
                    <ul className="space-y-2.5 text-sm text-green-800">
                      {plant.sowingPeriod && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">🌱</span>
                          <span className="min-w-0 break-words">Så inomhus: <strong>{plant.sowingPeriod}</strong></span>
                        </li>
                      )}
                      {plant.plantingPeriod && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">🪴</span>
                          <span className="min-w-0 break-words">Plantera ut: <strong>{plant.plantingPeriod}</strong></span>
                        </li>
                      )}
                      {plant.harvestPeriod && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">🌾</span>
                          <span className="min-w-0 break-words">Skörd: <strong>{plant.harvestPeriod}</strong></span>
                        </li>
                      )}
                      {plant.sunRequirement && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">☀️</span>
                          <span className="min-w-0 break-words">{plant.sunRequirement}</span>
                        </li>
                      )}
                      {plant.wateringNeeds && (
                        <li className="flex items-start gap-2">
                          <span className="shrink-0 text-base">💧</span>
                          <span className="min-w-0 break-words">{plant.wateringNeeds}</span>
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

                {/* Navigeringslänkar */}
                <div className="hidden lg:block space-y-2">
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

              {/* ── Vänster: innehåll ── */}
              <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 min-w-0">
                <PlantDetailTabs
                  plant={{
                    id:              plant.id,
                    name:            plant.name,
                    slug:            plant.slug,
                    description:     plant.description,
                    commonProblems:  plant.commonProblems,
                    difficultyLevel: plant.difficultyLevel,
                    category:        plant.category,
                    locationNotes:   plant.locationNotes,
                    soilPreparation: plant.soilPreparation,
                    indoorsStart,
                    plantingWindow,
                    harvestWindow,
                    hardinessZone:   null,
                    temperature:     null,
                    sunlight:        [],
                    goodNeighbors:   [],
                    badNeighbors:    [],
                    ph:              null,
                    soilTypes:       [],
                    drainage:        null,
                    nutrientLevel:   null,
                    soilNotes:       null,
                    growthPhases:    undefined,
                  }}
                  tips={plant.tips}
                  relatedGuides={relatedGuides}
                  relatedTerms={relatedTerms}
                  tipFormSlot={
                    <Suspense fallback={
                      <div className={`text-center py-6 bg-green-50 rounded-xl animate-pulse ${plant.tips.length > 0 ? "mt-4" : ""}`}>
                        <div className="h-4 w-48 bg-green-100 rounded mx-auto" />
                      </div>
                    }>
                      <PlantTipFormServer
                        plantId={plant.id}
                        plantSlug={plant.slug}
                        plantName={plant.name}
                        hasTips={plant.tips.length > 0}
                      />
                    </Suspense>
                  }
                />

                {/* Navigeringslänkar – mobil */}
                <div className="lg:hidden mt-6 space-y-2">
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
