import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { HEALTH_SYMPTOMS } from "@/lib/plant-health";
import { getAiSettings } from "@/lib/ai-settings";
import { checkAiUsage, incrementAiUsage, logAiFailure } from "@/lib/ai-usage";

export const maxDuration = 30;

// ── Typer ─────────────────────────────────────────────────────────

export interface HealthCheckResult {
  problemType:  string;       // "too_little_water" | "pests" etc
  problemLabel: string;       // "För lite vatten"
  emoji:        string;
  probability:  number;       // 0–100
  explanation:  string;
  action:       string;       // Omedelbar åtgärd
  steps:        string[];     // Steg-för-steg
  guides:       { id: string; title: string; slug: string; imageUrl: string | null }[];
  products:     { id: string; name: string; slug: string; imageUrl: string | null; price: number }[];
}

// SYMPTOMS används via HEALTH_SYMPTOMS från @/lib/plant-health

// ── Problemdefinitioner ───────────────────────────────────────────

const PROBLEM_DEFS: Record<string, {
  label: string; emoji: string;
  explanation: string; action: string; steps: string[];
  guideKeywords: string[]; productKeywords: string[];
}> = {
  too_little_water: {
    label: "För lite vatten", emoji: "🏜️",
    explanation: "Växten verkar lida av vattenbrist. När rötterna inte får tillräckligt med vatten tappar bladen turgor och torkar längs kanterna.",
    action: "Vattna ordentligt och kontrollera att överskottsvattnet kan rinna av.",
    steps: [
      "Känn på jorden – är den torr mer än 2 cm ner?",
      "Vattna grundligt tills vatten rinner ur krukans dräneringshål.",
      "Vänta tills de övre 2–3 cm av jorden är torra innan du vattnar igen.",
      "Placera inte växten i direkt sol under de varmaste timmarna.",
      "Kontrollera krukan – är den för liten behöver den bytas ut.",
    ],
    guideKeywords: ["vatten", "bevattning"],
    productKeywords: ["vattenkanna", "droppbevattning"],
  },
  too_much_water: {
    label: "För mycket vatten", emoji: "💧",
    explanation: "Tecken tyder på övervattning. Rötterna saknar syre och börjar ruttna vilket hindrar växten från att ta upp näring.",
    action: "Låt jorden torka ut ordentligt och kontrollera att krukan har bra dränering.",
    steps: [
      "Sluta vattna tills de övre 3–4 cm av jorden känns torra.",
      "Kontrollera krukans dräneringshål – är de igentäppta?",
      "Lyft upp krukan – är den oväntat tung är för mycket vatten kvar.",
      "Ta upp växten och inspektera rötterna – bruna, slemmiga rötter är rötröta.",
      "Klipp bort skadade rötter och plantera om i färsk, väldrainerande jord.",
    ],
    guideKeywords: ["dränering", "jord", "kruka"],
    productKeywords: ["jord", "perlite", "kruka"],
  },
  nutrient_deficiency: {
    label: "Näringsbrist", emoji: "🍂",
    explanation: "Missfärgning och dålig tillväxt tyder på att växten saknar viktiga näringsämnen, vanligtvis kväve, järn eller magnesium.",
    action: "Ge växten ett balanserat flytande gödselmedel och kontrollera jordens pH.",
    steps: [
      "Analysera bladfärgen: gult mellan bladnerverna = järnbrist, allmänt gult underifrån = kvävebrist.",
      "Ge en dos flytande allgödsel vid vattningen.",
      "Kontrollera jordens pH – optimalt är 6,0–7,0 för de flesta grönsaker.",
      "Byt jord om den är mer än 2 år gammal.",
      "Gödsla regelbundet under växtsäsongen (var 2–3 vecka).",
    ],
    guideKeywords: ["gödsel", "näring", "jord"],
    productKeywords: ["gödsel", "näring", "allgödsel"],
  },
  pests: {
    label: "Skadedjur", emoji: "🐛",
    explanation: "Synliga insekter eller typiska skador tyder på ett angrepp av skadedjur som bladlöss, spinnkvalster eller vita flygare.",
    action: "Identifiera skadedjuret och behandla med lämpligt medel omedelbart.",
    steps: [
      "Inspektera bladens undersida noga med ett förstoringsglas.",
      "Isolera den angripna växten från dina övriga växter.",
      "Skölj bladen med ljummet vatten för att mekaniskt avlägsna insekterna.",
      "Behandla med insektsmedel lämpat för skadedjuret (se etikett).",
      "Upprepa behandlingen efter 5–7 dagar för att bryta livscykeln.",
    ],
    guideKeywords: ["ohyra", "skadedjur", "bladlöss"],
    productKeywords: ["insektsmedel", "ohyra", "bekämpning"],
  },
  disease: {
    label: "Sjukdom", emoji: "🦠",
    explanation: "Fläckar, mögel eller vissning utan tydlig torka pekar på en svampsjukdom eller bakteriell infektion.",
    action: "Ta bort angripna växtdelar och behandla med lämpligt svampmedel.",
    steps: [
      "Klipp bort tydligt sjuka blad och delar med rena, desinficerade sekatörer.",
      "Undvik att vattna ovanifrån – fukta bara roten.",
      "Förbättra luftcirkulationen kring växten.",
      "Behandla med svampmedel eller bikarbonat-lösning (1 tsk per liter vatten).",
      "Bränn eller slänk sjuka växtdelar – lägg dem INTE i komposten.",
    ],
    guideKeywords: ["sjukdom", "svamp", "mögel"],
    productKeywords: ["svampmedel", "fungicid", "koppar"],
  },
  sun_damage: {
    label: "Solskada", emoji: "☀️",
    explanation: "Bleka eller brynta fläckar uppstår när växten utsätts för för stark sol, ofta efter flytt eller under värmebölja.",
    action: "Flytta växten till ett skuggigare läge och öka vattningen tillfälligt.",
    steps: [
      "Flytta växten ur direkt solljus under de varmaste timmarna (11–15).",
      "Vattna extra under värmeperioden – fuktig jord håller rötterna svalare.",
      "Skydda med skuggduk om växten inte kan flyttas.",
      "Klipp bort de värst skadade bladen.",
      "Anpassa gradvis om du vill öka ljusexponeringen framöver.",
    ],
    guideKeywords: ["sol", "ljus", "placering"],
    productKeywords: ["skuggduk", "skyddsnät"],
  },
  frost_damage: {
    label: "Frostskada", emoji: "❄️",
    explanation: "Svarta eller sladdriga partier på blad och skott är typiska tecken på frostskada som förstör växtcellerna.",
    action: "Ta in känsliga växter och vänta med att klippa tills frostrisk ej längre finns.",
    steps: [
      "Flytta känsliga växter inomhus eller under tak.",
      "Klipp INTE bort de frostskadade delarna direkt – de skyddar de friska delarna mot ny frost.",
      "Vänta tills frostrisk är över och ny tillväxt börjar synas.",
      "Vattna sparsamt tills växten återhämtar sig.",
      "Täck utomhusväxter med frostfleece nästa gång frost väntas.",
    ],
    guideKeywords: ["frost", "vinter", "skydd"],
    productKeywords: ["frostfleece", "vinterskydd"],
  },
  poor_soil: {
    label: "Dålig jord", emoji: "🪨",
    explanation: "Dålig dränering, packning eller utarmad jord hindrar rötterna från att andas och ta upp näring.",
    action: "Plantera om i ny, välstrukturerad jord med god dränering.",
    steps: [
      "Ta upp växten försiktigt och inspektera rötterna.",
      "Skaka bort gammal jord och skölj rötterna i ljummet vatten.",
      "Välj en jord anpassad för växttypen (t.ex. krukjord, kaktus-jord).",
      "Blanda in perlite eller sand för bättre dränering.",
      "Plantera om i en kruka med dräneringshål.",
    ],
    guideKeywords: ["jord", "plantera om", "substrat"],
    productKeywords: ["jord", "perlite", "substrat"],
  },
  root_problem: {
    label: "Rotproblem", emoji: "🌿",
    explanation: "Rotstockning (rotbunden) eller rötröta orsakar att växten inte kan ta upp vatten och näring trots normal vattning.",
    action: "Kontrollera rötterna och plantera om vid behov.",
    steps: [
      "Ta ur växten ur krukan och inspektera rötterna.",
      "Vita, fasta rötter är friska. Bruna, slemiga rötter är ruttna.",
      "Klipp bort ruttna rötter med rena sekatörer och beströ snittytan med kanel (naturlig svamphämmare).",
      "Plantera om i en större kruka med ny, väldrainerande jord.",
      "Vattna sparsamt de första 2 veckorna för att undvika ny rötröta.",
    ],
    guideKeywords: ["rötter", "plantera om", "dränering"],
    productKeywords: ["kruka", "jord", "dränering"],
  },
};

// ── Symptom → problem-poängsystem (mock) ─────────────────────────

const SYMPTOM_WEIGHTS: Record<string, Record<string, number>> = {
  yellow_leaves:   { nutrient_deficiency: 40, too_much_water: 30, too_little_water: 20, disease: 10 },
  brown_spots:     { sun_damage: 40, disease: 35, too_little_water: 15, frost_damage: 10 },
  holes_in_leaves: { pests: 80, disease: 15, frost_damage: 5 },
  drooping:        { too_little_water: 60, root_problem: 25, disease: 15 },
  white_spots:     { disease: 65, pests: 30, nutrient_deficiency: 5 },
  black_spots:     { disease: 70, sun_damage: 20, nutrient_deficiency: 10 },
  sticky_leaves:   { pests: 90, disease: 10 },
  dry_edges:       { too_little_water: 65, sun_damage: 25, nutrient_deficiency: 10 },
  slow_growth:     { nutrient_deficiency: 45, poor_soil: 30, root_problem: 25 },
  visible_pests:   { pests: 95, disease: 5 },
};

function computeMockDiagnosis(symptoms: string[]): Omit<HealthCheckResult, "guides" | "products">[] {
  const scores: Record<string, number> = {};

  for (const sym of symptoms) {
    const weights = SYMPTOM_WEIGHTS[sym] ?? {};
    for (const [problem, weight] of Object.entries(weights)) {
      scores[problem] = (scores[problem] ?? 0) + weight;
    }
  }

  if (Object.keys(scores).length === 0) {
    // Inga kända symptom – returnera generiskt
    scores["nutrient_deficiency"] = 40;
    scores["too_little_water"]    = 35;
    scores["disease"]             = 25;
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, raw]) => {
      const def = PROBLEM_DEFS[key];
      if (!def) return null;
      return {
        problemType:  key,
        problemLabel: def.label,
        emoji:        def.emoji,
        probability:  Math.round((raw / total) * 100),
        explanation:  def.explanation,
        action:       def.action,
        steps:        def.steps,
      };
    })
    .filter(Boolean) as Omit<HealthCheckResult, "guides" | "products">[];
}

// ── Plant.id Health Assessment ────────────────────────────────────

async function callPlantIdHealth(
  imageBase64: string,
  apiKey: string,
): Promise<Omit<HealthCheckResult, "guides" | "products">[]> {
  const res = await fetch("https://plant.id/api/v3/health_assessment", {
    method:  "POST",
    headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      images:         [imageBase64],
      similar_images: false,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Plant.id Health ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const suggestions: {
    name: string; probability: number;
    details?: {
      common_names?: string[];
      description?: string;
      treatment?: { biological?: string[]; chemical?: string[]; prevention?: string[] };
    };
  }[] = json?.result?.disease?.suggestions ?? [];

  return suggestions.slice(0, 3).map((s) => {
    const commonName = s.details?.common_names?.[0] ?? s.name;
    const treatment  = s.details?.treatment;

    // Mappa sjukdomsnamn till problemtyp
    const problemType = mapDiseaseToType(s.name);
    const def         = PROBLEM_DEFS[problemType] ?? PROBLEM_DEFS.disease;

    const steps = [
      ...(treatment?.prevention ?? []),
      ...(treatment?.biological ?? []),
      ...(treatment?.chemical   ?? []),
    ].slice(0, 5);

    return {
      problemType,
      problemLabel: commonName,
      emoji:        def.emoji,
      probability:  Math.round(s.probability * 100),
      explanation:  s.details?.description ?? def.explanation,
      action:       def.action,
      steps:        steps.length > 0 ? steps : def.steps,
    };
  });
}

function mapDiseaseToType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("water") || lower.includes("drought"))          return "too_little_water";
  if (lower.includes("overwater") || lower.includes("root rot"))     return "too_much_water";
  if (lower.includes("deficien") || lower.includes("chlorosis"))     return "nutrient_deficiency";
  if (lower.includes("aphid") || lower.includes("mite") || lower.includes("pest")) return "pests";
  if (lower.includes("frost") || lower.includes("cold"))             return "frost_damage";
  if (lower.includes("sun") || lower.includes("burn"))               return "sun_damage";
  return "disease";
}

// ── Hämta guider och produkter ────────────────────────────────────

async function fetchRelatedContent(
  results: Omit<HealthCheckResult, "guides" | "products">[],
  plantId: string | null,
  symptoms: string[],
): Promise<HealthCheckResult[]> {
  const topResult     = results[0];
  const problemTypes  = results.map((r) => r.problemType);
  const guideKeywords = results.flatMap((r) => PROBLEM_DEFS[r.problemType]?.guideKeywords ?? []).slice(0, 5);

  const [guides, products, plantInfo] = await Promise.all([
    // Guider: matcha på symptom-labels + problem-keywords
    guideKeywords.length > 0
      ? prisma.guide.findMany({
          where: {
            published: true,
            OR: guideKeywords.map((kw) => ({
              OR: [
                { title:    { contains: kw, mode: "insensitive" as const } },
                { excerpt:  { contains: kw, mode: "insensitive" as const } },
                { category: { contains: kw, mode: "insensitive" as const } },
                { content:  { contains: kw, mode: "insensitive" as const } },
              ],
            })),
          },
          select: { id: true, title: true, slug: true, imageUrl: true },
          take: 4,
        }).catch(() => [])
      : [],

    // Produkter via rekommendationsregler – matcha problemtyp, symptom och/eller växt
    prisma.shopProduct.findMany({
      where: {
        isActive: true,
        recommendationRules: {
          some: {
            isActive: true,
            OR: [
              ...(problemTypes.map((pt) => ({ problemType: pt }))),
              ...(symptoms.map((s)  => ({ symptom: s }))),
              ...(plantId ? [{ plantId }] : []),
            ],
          },
        },
      },
      select: { id: true, name: true, slug: true, imageUrl: true, price: true },
      orderBy: { recommendationRules: { _count: "desc" } },
      take: 4,
    }).catch(async () => {
      // Fallback: växt-länkade produkter eller featured
      if (plantId) {
        return prisma.shopProduct.findMany({
          where: { isActive: true, plantLinks: { some: { plantId } } },
          select: { id: true, name: true, slug: true, imageUrl: true, price: true },
          take: 3,
        }).catch(() => []);
      }
      return prisma.shopProduct.findMany({
        where: { isActive: true, isFeatured: true },
        select: { id: true, name: true, slug: true, imageUrl: true, price: true },
        take: 3,
      }).catch(() => []);
    }),

    // Växtinfo (om plantId angivet) – för att utöka guidesökning
    plantId
      ? prisma.plant.findUnique({
          where:  { id: plantId },
          select: { name: true, category: true },
        }).catch(() => null)
      : null,
  ]);

  // Om växt hittades, lägg till växtspecifika guider
  let allGuides = guides;
  if (plantInfo?.name) {
    const plantGuides = await prisma.guide.findMany({
      where: {
        published: true,
        OR: [
          { title:    { contains: plantInfo.name, mode: "insensitive" } },
          { category: { contains: plantInfo.category ?? "", mode: "insensitive" } },
          { excerpt:  { contains: plantInfo.name, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true, imageUrl: true },
      take: 2,
    }).catch(() => []);
    allGuides = [...plantGuides, ...guides].slice(0, 4);
  }

  // Ge varje resultatkort sina egna guider och produkter (delade, men kunde vara per-problem i framtiden)
  return results.map((r, i) => ({
    ...r,
    guides:   i === 0 ? allGuides : guides,
    products: i === 0 ? products  : [],
  }));
}

// ── Route handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData     = await req.formData();
    const image        = formData.get("image") as File | null;
    const symptomsRaw  = formData.get("symptoms") as string | null;
    const plantIdParam = formData.get("plantId")  as string | null;

    const symptoms: string[] = symptomsRaw ? JSON.parse(symptomsRaw) : [];

    if (symptoms.length === 0) {
      return NextResponse.json({ error: "Välj minst ett symptom." }, { status: 400 });
    }

    // ── AI-inställningar ──────────────────────────────────────────
    const aiSettings = await getAiSettings();

    if (!aiSettings.diagnosisEnabled) {
      return NextResponse.json(
        { error: "Växtdiagnos är för tillfället inaktiverad." },
        { status: 503 }
      );
    }

    // ── Auth ──────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    let profileId: string | null = null;
    if (authUser) {
      const profile = await prisma.profile.findUnique({
        where:  { userId: authUser.id },
        select: { id: true },
      }).catch(() => null);
      profileId = profile?.id ?? null;
    }

    // ── Kontrollera gratisgräns (inloggade användare) ─────────────
    if (profileId && aiSettings.freeChecksPerMonth > 0) {
      const usage = await checkAiUsage(profileId, "diagnosis", aiSettings.freeChecksPerMonth);
      if (!usage.allowed) {
        return NextResponse.json({
          error:   "limit_reached",
          message: `Du har nått din gräns på ${usage.limit} diagnoser den här månaden. Uppgradera till premium för fler analyser.`,
          used:    usage.used,
          limit:   usage.limit,
        }, { status: 429 });
      }
    }

    // ── Bild-upload ───────────────────────────────────────────────
    let imageUrl = "";
    let base64   = "";

    if (image && image.size > 0 && image.size <= 10 * 1024 * 1024) {
      const ext      = image.type === "image/png" ? "png" : "jpg";
      const folder   = profileId ?? "anonymous";
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer   = Buffer.from(await image.arrayBuffer());

      // base64 sätts alltid – behövs för AI-anropet oavsett om uppladdningen lyckas
      base64 = `data:${image.type};base64,${buffer.toString("base64")}`;

      const { error: uploadError } = await supabase.storage
        .from("plant-health-checks")
        .upload(filename, buffer, { contentType: image.type, upsert: false });

      if (!uploadError) {
        const { data } = supabase.storage.from("plant-health-checks").getPublicUrl(filename);
        imageUrl = data.publicUrl;
      }
    }

    // ── Diagnos ───────────────────────────────────────────────────
    let rawResults: Omit<HealthCheckResult, "guides" | "products">[];
    let provider = "mock";

    if (aiSettings.diagPlantIdKey && base64) {
      try {
        rawResults = await callPlantIdHealth(base64, aiSettings.diagPlantIdKey);
        provider   = "plant.id";
      } catch (err) {
        await logAiFailure({
          feature:   "diagnosis",
          provider:  "plant.id",
          error:     err instanceof Error ? err.message : String(err),
          profileId,
        });
        // Graceful fallback till mock
        rawResults = computeMockDiagnosis(symptoms);
      }
    } else {
      rawResults = computeMockDiagnosis(symptoms);
    }

    // ── Relaterat innehåll ────────────────────────────────────────
    const results = await fetchRelatedContent(rawResults, plantIdParam, symptoms);

    // ── Spara i DB + öka räknare ──────────────────────────────────
    let savedCheckId: string | null = null;

    if (profileId) {
      const [saved] = await Promise.all([
        prisma.plantHealthCheck.create({
          data: {
            userId:      profileId,
            plantId:     plantIdParam ?? undefined,
            imageUrl:    imageUrl || undefined,
            symptoms,
            resultsJson: results as object,
            apiProvider: provider,
          },
          select: { id: true },
        }).catch(() => null),
        // Öka användningsräknaren
        aiSettings.freeChecksPerMonth > 0
          ? incrementAiUsage(profileId, "diagnosis")
          : Promise.resolve(),
      ]);
      savedCheckId = saved?.id ?? null;
    }

    return NextResponse.json({
      results,
      provider,
      isMock:       provider === "mock",
      disclaimer:   aiSettings.disclaimerText,
      savedCheckId,          // länk till /min-odling/vaxtproblem/[id]
    });
  } catch (err) {
    console.error("[health-check] unexpected error:", err);
    return NextResponse.json({ error: "Något gick fel. Försök igen." }, { status: 500 });
  }
}
