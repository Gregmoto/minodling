"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Lightbulb, CalendarDays, BarChart2, Info,
  AlertTriangle, MapPin, FlaskConical, TrendingUp,
  HelpCircle, Star, Leaf,
} from "lucide-react";
import { ScrollableTabs, type TabItem } from "@/components/ui/ScrollableTabs";
import { PlantingCalendar, type CalendarPeriod } from "@/components/plants/PlantingCalendar";
import { DifficultySection, type DifficultyLevel } from "@/components/plants/DifficultySection";
import { LocationSection, type SunlightLevel, type Neighbor } from "@/components/plants/LocationSection";
import { SoilSection, type SoilType, type DrainageType, type NutrientLevel } from "@/components/plants/SoilSection";
import { GrowthTimeline, type PhaseData } from "@/components/plants/GrowthTimeline";
import { HowTosSection, type HowToPhaseData } from "@/components/plants/HowTosSection";
import { FaqSection, type FaqItem } from "@/components/plants/FaqSection";
import { BenefitsSection, type NutritionFact, type Recipe } from "@/components/plants/BenefitsSection";
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
    // Kalender
    indoorsStart?:   CalendarPeriod | null;
    harvestWindow?:  CalendarPeriod | null;
    // Plats
    hardinessZone?:  { min: number; max: number } | null;
    temperature?:    { min: number; max: number } | null;
    sunlight?:       SunlightLevel[];
    goodNeighbors?:  Neighbor[];
    badNeighbors?:   Neighbor[];
    // Jord
    ph?:             { min: number; max: number } | null;
    soilTypes?:      SoilType[];
    drainage?:       DrainageType | null;
    nutrientLevel?:  NutrientLevel | null;
    soilNotes?:      string | null;
    // Tillväxt
    growthPhases?:   PhaseData[];
    // How-tos
    howToPhases?:    HowToPhaseData[];
    // FAQ
    faqItems?:       FaqItem[];
    // Fördelar
    benefitsText?:   string | null;
    nutrition?:      NutritionFact[];
    recipes?:        Recipe[];
    benefitsTags?:   string[];
  };
  tips:          Tip[];
  relatedGuides: Guide[];
  relatedTerms:  GlossaryTerm[];
  isLoggedIn:    boolean;
  initialGrowing?: boolean;
}

// ── Flik-definitioner ─────────────────────────────────────────────

const ALL_TABS: TabItem[] = [
  { id: "om",             label: "Om växten",          icon: <Info          className="h-3.5 w-3.5" /> },
  { id: "kalender",       label: "Planteringskalender", icon: <CalendarDays  className="h-3.5 w-3.5" /> },
  { id: "svarighetsgrad", label: "Svårighetsgrad",      icon: <BarChart2     className="h-3.5 w-3.5" /> },
  { id: "plats",          label: "Lämplig plats",       icon: <MapPin        className="h-3.5 w-3.5" /> },
  { id: "jord",           label: "Jordförberedelse",    icon: <FlaskConical  className="h-3.5 w-3.5" /> },
  { id: "tillvaxt",       label: "Tillväxtperiod",      icon: <TrendingUp    className="h-3.5 w-3.5" /> },
  { id: "howtos",         label: "Odlingsguider",       icon: <BookOpen      className="h-3.5 w-3.5" /> },
  { id: "faq",            label: "FAQ",                 icon: <HelpCircle    className="h-3.5 w-3.5" /> },
  { id: "benefits",       label: "Näringsvärden",       icon: <Leaf          className="h-3.5 w-3.5" /> },
  { id: "tips",           label: "Tips",                icon: <Lightbulb     className="h-3.5 w-3.5" /> },
  { id: "guider",         label: "Guider",              icon: <Star          className="h-3.5 w-3.5" /> },
];

// ── Komponent ─────────────────────────────────────────────────────

export function PlantDetailTabs({
  plant,
  tips,
  relatedGuides,
  relatedTerms,
  isLoggedIn,
  initialGrowing = false,
}: PlantDetailTabsProps) {
  const [activeTab,  setActiveTab]  = useState("om");
  const [isPlanning, setIsPlanning] = useState(false);
  const [isGrowing,  setIsGrowing]  = useState(initialGrowing);

  const difficulty = (plant.difficultyLevel as DifficultyLevel | null) ?? null;

  // Dölj flikar utan data
  const visibleTabs = ALL_TABS.filter((t) => {
    if (t.id === "faq"    && (!plant.faqItems    || plant.faqItems.length === 0))    return false;
    if (t.id === "guider" && relatedGuides.length === 0 && relatedTerms.length === 0) return false;
    return true;
  });

  return (
    <>
      {/* ── Sticky tab-nav ── */}
      <ScrollableTabs
        tabs={visibleTabs}
        activeId={activeTab}
        onSelect={setActiveTab}
        sticky
        stickyTop={56}
        stickyBg="bg-cream-50"
        size="sm"
        className="mb-6"
      />

      {/* ── Om växten ── */}
      {activeTab === "om" && (
        <div className="space-y-6 animate-fade-in">
          {plant.description ? (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Om {plant.name}</h2>
              <div
                className="prose prose-sm prose-sage max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: plant.description }}
              />
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
          {plant.commonProblems && (
            <Card padding="lg">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Vanliga problem
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {plant.commonProblems}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Planteringskalender ── */}
      {activeTab === "kalender" && (
        <Card padding="lg" className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-green-600" />
            Planteringskalender
          </h2>
          <PlantingCalendar
            indoors={plant.indoorsStart ?? null}
            harvest={plant.harvestWindow ?? null}
            plantType={plant.name}
            frostSensitive={plant.frostSensitive}
          />
        </Card>
      )}

      {/* ── Svårighetsgrad ── */}
      {activeTab === "svarighetsgrad" && (
        <Card padding="lg" className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Svårighetsgrad</h2>
          {difficulty ? (
            <DifficultySection
              difficulty={difficulty}
              isPlanning={isPlanning}
              isGrowing={isGrowing}
              onPlanToGrow={() => setIsPlanning((p) => !p)}
              onGrowingIt={() => setIsGrowing((g) => !g)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <BarChart2 className="h-10 w-10 text-gray-200" />
              <p className="text-gray-400 text-sm">Ingen svårighetsbedömning tillgänglig.</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Lämplig plats ── */}
      {activeTab === "plats" && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Lämplig plats
          </h2>
          <LocationSection
            hardinessZone={plant.hardinessZone}
            temperature={plant.temperature}
            sunlight={plant.sunlight}
            goodNeighbors={plant.goodNeighbors}
            badNeighbors={plant.badNeighbors}
          />
        </div>
      )}

      {/* ── Jordförberedelse ── */}
      {activeTab === "jord" && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-green-600" />
            Jordförberedelse
          </h2>
          <SoilSection
            ph={plant.ph}
            soilTypes={plant.soilTypes}
            drainage={plant.drainage}
            nutrientLevel={plant.nutrientLevel}
            notes={plant.soilNotes}
          />
        </div>
      )}

      {/* ── Tillväxtperiod ── */}
      {activeTab === "tillvaxt" && (
        <Card padding="lg" className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-8 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Tillväxtperiod
          </h2>
          <GrowthTimeline phases={plant.growthPhases} />
        </Card>
      )}

      {/* ── Odlingsguider (how-tos) ── */}
      {activeTab === "howtos" && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Odlingsguider
          </h2>
          <HowTosSection phases={plant.howToPhases} />
        </div>
      )}

      {/* ── FAQ ── */}
      {activeTab === "faq" && plant.faqItems && (
        <Card padding="lg" className="animate-fade-in">
          <FaqSection items={plant.faqItems} />
        </Card>
      )}

      {/* ── Näringsvärden & fördelar ── */}
      {activeTab === "benefits" && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Näringsvärden & fördelar
          </h2>
          <BenefitsSection
            benefitsText={plant.benefitsText}
            nutrition={plant.nutrition}
            recipes={plant.recipes}
            tags={plant.benefitsTags}
          />
        </div>
      )}

      {/* ── Tips ── */}
      {activeTab === "tips" && (
        <Card padding="lg" className="animate-fade-in">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            Tips från odlare
            {tips.length > 0 && (
              <span className="ml-auto text-sm font-normal text-gray-400">
                {tips.length} tips
              </span>
            )}
          </h2>
          {tips.length > 0 && (
            <div className="space-y-4 mb-6">
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
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/profil/${tip.author.username}`}
                        className="text-sm font-medium text-gray-800 hover:text-green-700"
                      >
                        {tip.author.fullName ?? tip.author.username}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {formatRelativeDate(tip.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{tip.content}</p>
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
            <div className={cn("text-center py-8 bg-green-50 rounded-xl", tips.length > 0 && "mt-4")}>
              <p className="text-sm text-green-700">
                <Link href={`/auth/login?redirect=/vaxtdatabas/${plant.slug}`} className="font-medium underline">
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
      )}

      {/* ── Guider & ordlista ── */}
      {activeTab === "guider" && (
        <div className="space-y-6 animate-fade-in">
          {relatedGuides.length > 0 && (
            <Card padding="lg">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <BookOpen className="h-5 w-5 text-green-600" />
                Relaterade guider
              </h2>
              <ul className="space-y-2">
                {relatedGuides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guider/${g.slug}`} className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 hover:underline transition-colors">
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
              <h2 className="text-base font-semibold text-gray-900 mb-3">Odlingsordlista</h2>
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

      {/* ── Global sticky bottom actions ── */}
      <StickyPlantActions
        isPlanning={isPlanning}
        isGrowing={isGrowing}
        onPlanToGrow={() => setIsPlanning((p) => !p)}
        onGrowingIt={() => setIsGrowing((g) => !g)}
        mobileOnly
      />
      <StickyPlantActionsSpacer mobileOnly />
    </>
  );
}
