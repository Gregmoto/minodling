import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import type { RelatedGuide, RelatedProduct } from "@/lib/plant-health";

export const maxDuration = 30;

// ── Typer ─────────────────────────────────────────────────────────

export interface DbPlantInfo {
  id:             string;
  name:           string;
  slug:           string;
  imageUrl:       string | null;
  latinName:      string | null;
  description:    string | null;
  category:       string | null;
  wateringNeeds:  string | null;
  sunRequirement: string | null;
  soilType:       string | null;
  sowingPeriod:   string | null;
  plantingPeriod: string | null;
  harvestPeriod:  string | null;
}

export interface IdentificationResult {
  latinName:   string;
  commonName:  string | null;
  probability: number;          // 0–100
  imageUrl:    string | null;
  dbPlant:     DbPlantInfo | null;
  guides:      RelatedGuide[];
  products:    RelatedProduct[];
}

// ── Mock-svar ─────────────────────────────────────────────────────

const MOCK_RESULTS: Omit<IdentificationResult, "dbPlant" | "guides" | "products">[] = [
  { latinName: "Solanum lycopersicum", commonName: "Tomat",     probability: 87, imageUrl: null },
  { latinName: "Solanum melongena",    commonName: "Aubergine",  probability: 8,  imageUrl: null },
  { latinName: "Capsicum annuum",      commonName: "Paprika",    probability: 5,  imageUrl: null },
];

// ── Plant.id v3 ───────────────────────────────────────────────────

async function callPlantId(
  imageBase64: string,
  apiKey: string,
): Promise<Omit<IdentificationResult, "dbPlant" | "guides" | "products">[]> {
  const res = await fetch("https://plant.id/api/v3/identification", {
    method:  "POST",
    headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      images: [imageBase64], similar_images: true, classification_level: "species",
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Plant.id ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  const suggestions = json?.result?.classification?.suggestions ?? [];
  return suggestions.slice(0, 3).map((s: {
    name: string; probability: number;
    similar_images?: { url: string }[];
    details?: { common_names?: string[] };
  }) => ({
    latinName:   s.name,
    commonName:  s.details?.common_names?.[0] ?? null,
    probability: Math.round(s.probability * 100),
    imageUrl:    s.similar_images?.[0]?.url ?? null,
  }));
}

// ── PlantNet ──────────────────────────────────────────────────────

async function callPlantNet(
  imageBase64: string,
  apiKey: string,
): Promise<Omit<IdentificationResult, "dbPlant" | "guides" | "products">[]> {
  const byteString = atob(imageBase64.replace(/^data:image\/\w+;base64,/, ""));
  const ab  = new ArrayBuffer(byteString.length);
  const ia  = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: "image/jpeg" });
  const fd   = new FormData();
  fd.append("images", blob, "plant.jpg");
  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&lang=sv&nb-results=3`;
  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`PlantNet ${res.status}`);
  const json = await res.json();
  return (json.results ?? []).slice(0, 3).map((r: {
    score: number;
    species: { scientificNameWithoutAuthor: string; commonNames?: string[]; images?: { url: { o: string } }[] };
  }) => ({
    latinName:   r.species.scientificNameWithoutAuthor,
    commonName:  r.species.commonNames?.[0] ?? null,
    probability: Math.round(r.score * 100),
    imageUrl:    r.species.images?.[0]?.url?.o ?? null,
  }));
}

// ── Matcha mot DB + lägg till guider & produkter ─────────────────

async function enrichResults(
  results: Omit<IdentificationResult, "dbPlant" | "guides" | "products">[],
): Promise<IdentificationResult[]> {
  const latinNames = results.map((r) => r.latinName.toLowerCase());

  // Hämta matchande växter med alla info-fält
  const plants = await prisma.plant.findMany({
    where: {
      OR: latinNames.map((n) => ({ latinName: { equals: n, mode: "insensitive" as const } })),
    },
    select: {
      id: true, name: true, slug: true, imageUrl: true, latinName: true,
      description: true, category: true, wateringNeeds: true,
      sunRequirement: true, soilType: true,
      sowingPeriod: true, plantingPeriod: true, harvestPeriod: true,
    },
  }).catch(() => []);

  // Bygg en map latinName → dbPlant
  const plantMap = new Map(plants.map((p) => [p.latinName?.toLowerCase() ?? "", p]));

  // Hämta alla unika plant-ids som matchades
  const matchedPlantIds = plants.map((p) => p.id);

  // Hämta guider och produkter parallellt
  const topPlant = plants[0];
  const [guides, products] = await Promise.all([
    topPlant
      ? prisma.guide.findMany({
          where: {
            published: true,
            OR: [
              { title:    { contains: topPlant.name,     mode: "insensitive" } },
              { category: { contains: topPlant.category ?? "", mode: "insensitive" } },
              { excerpt:  { contains: topPlant.name,     mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true, slug: true, imageUrl: true },
          take: 4,
        }).catch(() => [])
      : [] as RelatedGuide[],

    matchedPlantIds.length > 0
      ? prisma.shopProduct.findMany({
          where: {
            isActive: true,
            OR: [
              { plantLinks: { some: { plantId: { in: matchedPlantIds } } } },
              {
                recommendationRules: {
                  some: {
                    isActive: true,
                    OR: [
                      { plantId: { in: matchedPlantIds } },
                      { plantId: null },
                    ],
                  },
                },
              },
            ],
          },
          select: { id: true, name: true, slug: true, imageUrl: true, price: true },
          orderBy: { isFeatured: "desc" },
          take: 4,
        }).catch(() => [])
      : prisma.shopProduct.findMany({
          where: { isActive: true, isFeatured: true },
          select: { id: true, name: true, slug: true, imageUrl: true, price: true },
          take: 3,
        }).catch(() => []) as Promise<RelatedProduct[]>,
  ]);

  return results.map((r) => ({
    ...r,
    dbPlant: plantMap.get(r.latinName.toLowerCase()) ?? null,
    guides,
    products,
  }));
}

// ── Route handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file || file.size === 0)
      return NextResponse.json({ error: "Ingen bild skickades" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: "Bilden är för stor (max 10 MB)" }, { status: 400 });

    // ── Auth ──────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    let profileId: string | null = null;
    if (authUser) {
      const profile = await prisma.profile.findUnique({
        where: { userId: authUser.id }, select: { id: true },
      }).catch(() => null);
      profileId = profile?.id ?? null;
    }

    // ── Supabase Storage ──────────────────────────────────────────
    const ext      = file.type === "image/png" ? "png" : "jpg";
    const folder   = profileId ?? "anonymous";
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("plant-identifications")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    let imageUrl = "";
    if (!uploadError) {
      const { data } = supabase.storage.from("plant-identifications").getPublicUrl(filename);
      imageUrl = data.publicUrl;
    }

    // ── API-nycklar ───────────────────────────────────────────────
    const [plantIdSetting, plantNetSetting] = await Promise.all([
      prisma.adminSetting.findUnique({ where: { key: "plant_id_api_key" } }).catch(() => null),
      prisma.adminSetting.findUnique({ where: { key: "plantnet_api_key" } }).catch(() => null),
    ]);
    const plantIdKey  = plantIdSetting?.value?.trim()  || null;
    const plantNetKey = plantNetSetting?.value?.trim() || null;

    // ── Identifiera ───────────────────────────────────────────────
    let rawResults: Omit<IdentificationResult, "dbPlant" | "guides" | "products">[];
    let provider = "mock";

    if (plantIdKey) {
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      rawResults = await callPlantId(base64, plantIdKey);
      provider   = "plant.id";
    } else if (plantNetKey) {
      const base64 = buffer.toString("base64");
      rawResults = await callPlantNet(base64, plantNetKey);
      provider   = "plantnet";
    } else {
      rawResults = MOCK_RESULTS;
    }

    // ── Berika med DB-info, guider & produkter ────────────────────
    const results = await enrichResults(rawResults);

    // ── Spara ─────────────────────────────────────────────────────
    if (profileId && imageUrl) {
      await prisma.plantIdentification.create({
        data: {
          userId:      profileId,
          imageUrl,
          resultsJson: results as object,
          apiProvider: provider,
        },
      }).catch(() => null);
    }

    return NextResponse.json({ results, imageUrl, provider });
  } catch (err) {
    console.error("identify-plant error:", err);
    return NextResponse.json({ error: "Något gick fel. Försök igen." }, { status: 500 });
  }
}
