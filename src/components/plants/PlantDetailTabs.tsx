"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Lightbulb, CalendarDays, Info,
  AlertTriangle, MapPin, FlaskConical, TrendingUp, Leaf,
} from "lucide-react";
import { PlantingCalendar, type CalendarPeriod } from "@/components/plants/PlantingCalendar";
import { LocationSection, type SunlightLevel, type Neighbor } from "@/components/plants/LocationSection";
import { SoilSection, type SoilType, type DrainageType, type NutrientLevel } from "@/components/plants/SoilSection";
import { GrowthTimeline, type PhaseData } from "@/components/plants/GrowthTimeline";
import { StickyPlantActions, StickyPlantActionsSpacer } from "@/components/plants/StickyPlantActions";
import { PlantTipForm } from "@/components/plants/PlantTipForm";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";

// ── Typer ─────────────────────────────────────────────────────────

interface Tip {
  id:        string;
  content:   string;
  imageUrl:  string | null;
  createdAt: Date;
  author: {
    username:  string;
    fullName:  string | null;
    avatarUrl: string | null;
  };
}

interface Guide {
  slug:  string;
  title: string;
}

interface GlossaryTerm {
  slug: string;
  term: string;
}

export interface PlantDetailTabsProps {
  plant: {
    id:              string;
    name:            string;
    slug:            string;
    description:     string | null;
    commonProblems:  string | null;
    difficultyLevel: string | null;
    category:        string | null;
    frostSensitive?: boolean;
    locationNotes?:   string | null;
    soilPreparation?: string | null;
    indoorsStart?:   CalendarPeriod | null;
    plantingWindow?: CalendarPeriod | null;
    harvestWindow?:  CalendarPeriod | null;
    hardinessZone?:  { min: number; max: number } | null;
    temperature?:    { min: number; max: number } | null;
    sunlight?:       SunlightLevel[];
    goodNeighbors?:  Neighbor[];
    badNeighbors?:   Neighbor[];
    ph?:             { min: number; max: number } | null;
    soilTypes?:      SoilType[];
    drainage?:       DrainageType | null;
    nutrientLevel?:  NutrientLevel | null;
    soilNotes?:      string | null;
    growthPhases?:   PhaseData[];
  };
  tips:          Tip[];
  relatedGuides: Guide[];
  relatedTerms:  GlossaryTerm[];
  isLoggedIn:    boolean;
  initialGrowing?: boolean;
}

// ── Hjälpkomponent: hanterar HTML och ren text ────────────────────

function PlantTextContent({ text }: { text: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isHtml) {
    return (
      <div
        className="prose prose-sm prose-sage max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-line">{para.trim()}</p>
      ))}
    </div>
  );
}

// ── Sektionsrubrik ────────────────────────────────────────────────

function SectionHeading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
      <span className="text-green-600">{icon}</span>
      {children}
    </h2>
  );
}

// ── Komponent ─────────────────────────────────────────────────────

export function PlantDetailTabs({
  plant,
  tips,
  relatedGuides,
  relatedTerms,
  isLoggedIn,
  initialGrowing = false,
}: PlantDetailTabsProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [isGrowing,  setIsGrowing]  = useState(initialGrowing);

  const hasCalendar     = !!(plant.indoorsStart || plant.plantingWindow || plant.harvestWindow);
  const hasGrowth       = !!(plant.growthPhases && plant.growthPhases.length > 0);
  const hasSoilData     = !!(plant.soilPreparation || plant.soilNotes || plant.ph || (plant.soilTypes?.length ?? 0) > 0);
  const hasLocationData = !!(plant.locationNotes || plant.hardinessZone || (plant.sunlight?.length ?? 0) > 0 || plant.goodNeighbors?.length || plant.temperature);

  return (
    <div className="min-w-0 [overflow-x:clip] space-y-6">

      {/* 1. Om växten */}
      {plant.description ? (
        <Card padding="lg">
          <SectionHeading icon={<Info className="h-5 w-5" />}>
            Om {plant.name}
          </SectionHeading>
          <PlantTextContent text={plant.description} />
        </Card>
      ) : (
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <Info className="h-10 w-10 text-gray-200" />
            <p className="text-gray-400 text-sm">
              Odlingsguide för {plant.name} är under uppbyggnad.
            </p>
          </div>
        </Card>
      )}

      {/* 2. Planteringskalender */}
      {hasCalendar && (
        <Card padding="lg">
          <SectionHeading icon={<CalendarDays className="h-5 w-5" />}>
            Planteringskalender
          </SectionHeading>
          <PlantingCalendar
            indoors={plant.indoorsStart ?? null}
            planting={plant.plantingWindow ?? null}
            harvest={plant.harvestWindow ?? null}
            plantType={plant.name}
            frostSensitive={plant.frostSensitive}
          />
        </Card>
      )}

      {/* 3. Tillväxtperiod */}
      {hasGrowth && (
        <Card padding="lg">
          <SectionHeading icon={<TrendingUp className="h-5 w-5" />}>
            Tillväxtperiod
          </SectionHeading>
          <GrowthTimeline phases={plant.growthPhases} />
        </Card>
      )}

      {/* 4. Jordförberedelse */}
      {hasSoilData && (
        <Card padding="lg">
          <SectionHeading icon={<FlaskConical className="h-5 w-5" />}>
            Jordförberedelse
          </SectionHeading>
          {plant.soilPreparation && (
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-4">
              {plant.soilPreparation}
            </p>
          )}
          <SoilSection
            ph={plant.ph}
            soilTypes={plant.soilTypes}
            drainage={plant.drainage}
            nutrientLevel={plant.nutrientLevel}
            notes={plant.soilNotes}
          />
        </Card>
      )}

      {/* 5. Lämplig plats */}
      {hasLocationData && (
        <Card padding="lg">
          <SectionHeading icon={<MapPin className="h-5 w-5" />}>
            Lämplig plats
          </SectionHeading>
          {plant.locationNotes && (
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-4">
              {plant.locationNotes}
            </p>
          )}
          <LocationSection
            hardinessZone={plant.hardinessZone}
            temperature={plant.temperature}
            sunlight={plant.sunlight}
            goodNeighbors={plant.goodNeighbors}
            badNeighbors={plant.badNeighbors}
          />
        </Card>
      )}

      {/* 6. Vanliga problem */}
      {plant.commonProblems && (
        <Card padding="lg">
          <SectionHeading icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}>
            Vanliga problem & lösningar
          </SectionHeading>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {plant.commonProblems}
          </div>
        </Card>
      )}

      {/* 7. Tips från odlare */}
      <Card padding="lg">
        <SectionHeading icon={<Lightbulb className="h-5 w-5 text-amber-400" />}>
          Tips från odlare
          {tips.length > 0 && (
            <span className="ml-auto text-sm font-normal text-gray-400">{tips.length} tips</span>
          )}
        </SectionHeading>

        {tips.length > 0 && (
          <div className="space-y-5 mb-6">
            {tips.map((tip) => (
              <div key={tip.id} className="flex gap-3">
                <Link href={`/profil/${tip.author.username}`} className="shrink-0">
                  <Avatar
                    src={tip.author.avatarUrl}
                    fallback={tip.author.fullName ?? tip.author.username}
                    size="sm"
                  />
                </Link>
                <div className="flex-1 bg-sage-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Link
                      href={`/profil/${tip.author.username}`}
                      className="text-sm font-medium text-gray-800 hover:text-green-700"
                    >
                      {tip.author.fullName ?? tip.author.username}
                    </Link>
                    <span className="text-xs text-gray-400">{formatRelativeDate(tip.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{tip.content}</p>
                  {tip.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={tip.imageUrl}
                        alt="Bild från odlare"
                        className="rounded-xl max-h-64 w-auto object-cover border border-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(tip.imageUrl!, "_blank")}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoggedIn ? (
          <div className={cn("pt-2", tips.length > 0 && "border-t border-gray-100")}>
            <p className="text-sm text-gray-500 mb-3">Dela ditt tips om {plant.name}:</p>
            <PlantTipForm plantId={plant.id} />
          </div>
        ) : (
          <div className={cn("text-center py-6 bg-green-50 rounded-xl", tips.length > 0 && "mt-4")}>
            <p className="text-sm text-green-700">
              <Link
                href={`/auth/login?redirect=/vaxtdatabas/${plant.slug}`}
                className="font-medium underline"
              >
                Logga in
              </Link>{" "}
              för att dela ditt eget tips
            </p>
          </div>
        )}

        {tips.length === 0 && !isLoggedIn && (
          <p className="text-sm text-gray-400 text-center py-4 mt-2">
            Inga tips än – bli den första!
          </p>
        )}
      </Card>

      {/* 8. Relaterade guider */}
      {(relatedGuides.length > 0 || relatedTerms.length > 0) && (
        <div className="space-y-4">
          {relatedGuides.length > 0 && (
            <Card padding="lg">
              <SectionHeading icon={<BookOpen className="h-5 w-5" />}>
                Relaterade guider
              </SectionHeading>
              <ul className="space-y-2">
                {relatedGuides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guider/${g.slug}`}
                      className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 hover:underline transition-colors"
                    >
                      <span className="text-green-400">›</span>
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {relatedTerms.length > 0 && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Odlingsordlista</h3>
              <div className="flex flex-wrap gap-2">
                {relatedTerms.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/ordlista/${t.slug}`}
                    className="px-3 py-1 bg-sage-50 text-sage-700 text-sm rounded-full hover:bg-sage-100 transition-colors border border-sage-200"
                  >
                    {t.term}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Sticky bottom actions (mobil) */}
      <StickyPlantActions
        isPlanning={isPlanning}
        isGrowing={isGrowing}
        onPlanToGrow={() => setIsPlanning((p) => !p)}
        onGrowingIt={() => setIsGrowing((g) => !g)}
        mobileOnly
      />
      <StickyPlantActionsSpacer mobileOnly />
    </div>
  );
}
