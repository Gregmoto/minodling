"use client";

import { cn } from "@/lib/utils";
import { Flame, Wheat, Beef, Droplets, Apple, Leaf } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export interface NutritionFact {
  label:   string;
  value:   string;
  unit?:   string;
  /** 0–100, används för progress-bar */
  pct?:    number;
}

export interface Recipe {
  title:     string;
  imageUrl?: string | null;
  emoji?:    string;
  href?:     string;
  duration?: string;
}

export interface BenefitsSectionProps {
  /** Fritext om hälsofördelar */
  benefitsText?:  string | null;
  /** Näringsvärden per 100 g */
  nutrition?:     NutritionFact[];
  /** Recept-kort */
  recipes?:       Recipe[];
  /** Visas ovan benefits-text */
  tags?:          string[];
  className?:     string;
}

// ── Näringsvärdes-ikoner ──────────────────────────────────────────

const NUTRITION_ICONS: Record<string, React.ReactNode> = {
  "Kalorier":    <Flame   className="h-4 w-4" />,
  "Kolhydrater": <Wheat   className="h-4 w-4" />,
  "Protein":     <Beef    className="h-4 w-4" />,
  "Fett":        <Droplets className="h-4 w-4" />,
  "Fiber":       <Leaf    className="h-4 w-4" />,
  "Socker":      <Apple   className="h-4 w-4" />,
};

function getNutritionIcon(label: string) {
  return NUTRITION_ICONS[label] ?? <Apple className="h-4 w-4" />;
}

// ── Default näringsvärden (tomat som exempel) ─────────────────────

const DEFAULT_NUTRITION: NutritionFact[] = [
  { label: "Kalorier",    value: "18",  unit: "kcal", pct: 9  },
  { label: "Kolhydrater", value: "3.9", unit: "g",    pct: 3  },
  { label: "Protein",     value: "0.9", unit: "g",    pct: 2  },
  { label: "Fett",        value: "0.2", unit: "g",    pct: 1  },
  { label: "Fiber",       value: "1.2", unit: "g",    pct: 5  },
  { label: "Socker",      value: "2.6", unit: "g",    pct: 3  },
];

// ── Recept-kort ───────────────────────────────────────────────────

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const inner = (
    <div className={cn(
      "group relative rounded-2xl overflow-hidden border border-gray-100",
      "bg-white shadow-sm hover:shadow-md transition-all duration-200",
      "flex flex-col",
      recipe.href && "cursor-pointer",
    )}>
      {/* Bild / Emoji */}
      <div className="relative h-36 w-full overflow-hidden bg-gray-50">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl bg-gradient-to-br from-green-50 to-harvest-50">
            {recipe.emoji ?? "🥗"}
          </div>
        )}
        {recipe.duration && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {recipe.duration}
          </span>
        )}
      </div>

      {/* Titel */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-green-700 transition-colors">
          {recipe.title}
        </p>
      </div>
    </div>
  );

  if (recipe.href) {
    return (
      <a href={recipe.href} className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

// ── Näringsvärdesrad ──────────────────────────────────────────────

function NutritionRow({ fact }: { fact: NutritionFact }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-green-500 shrink-0">{getNutritionIcon(fact.label)}</span>
      <span className="text-sm text-gray-600 w-28 shrink-0">{fact.label}</span>
      <div className="flex-1 flex items-center gap-2">
        {fact.pct !== undefined && (
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700"
              style={{ width: `${Math.min(100, fact.pct)}%` }}
            />
          </div>
        )}
        <span className="text-sm font-bold text-gray-900 shrink-0">
          {fact.value}
          {fact.unit && <span className="font-normal text-gray-400 ml-0.5">{fact.unit}</span>}
        </span>
      </div>
    </div>
  );
}

// ── Huvudkomponent ────────────────────────────────────────────────

export function BenefitsSection({
  benefitsText,
  nutrition  = DEFAULT_NUTRITION,
  recipes    = [],
  tags       = [],
  className,
}: BenefitsSectionProps) {
  return (
    <div className={cn("space-y-8", className)}>

      {/* ── Hälsofördelar ── */}
      {(benefitsText || tags.length > 0) && (
        <div className="space-y-4">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {benefitsText && (
            <div className="prose prose-sm prose-sage max-w-none text-gray-700 leading-relaxed">
              <p>{benefitsText}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Näringsvärden ── */}
      {nutrition.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Näringsvärden</h3>
            <span className="text-xs text-gray-400">per 100 g</span>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 px-4 py-1 shadow-sm">
            {nutrition.map((fact) => (
              <NutritionRow key={fact.label} fact={fact} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recept ── */}
      {recipes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Recept med {recipes.length > 1 ? "denna växt" : "denna växt"}
          </h3>
          <div className={cn(
            "grid gap-4",
            recipes.length === 1 && "grid-cols-1 max-w-xs",
            recipes.length === 2 && "grid-cols-2",
            recipes.length >= 3 && "grid-cols-2 sm:grid-cols-3",
          )}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.title} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
