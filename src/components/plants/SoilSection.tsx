"use client";

import { cn } from "@/lib/utils";
import { Gauge, Layers, Droplets, FlaskConical } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export type SoilType = "sand" | "loam" | "clay" | "silt" | "peat" | "chalk";
export type DrainageType = "excellent" | "good" | "moderate" | "poor";
export type NutrientLevel = "low" | "medium" | "high";

export interface SoilSectionProps {
  /** pH-intervall, t.ex. { min: 6.0, max: 7.0 } */
  ph?:           { min: number; max: number } | null;
  /** Jordtyper */
  soilTypes?:    SoilType[];
  /** Dränering */
  drainage?:     DrainageType | null;
  /** Näringsnivå */
  nutrientLevel?: NutrientLevel | null;
  /** Fri anmärkning om jordförberedelse */
  notes?:        string | null;
  className?:    string;
}

// ── Etiketter ─────────────────────────────────────────────────────

const SOIL_LABELS: Record<SoilType, string> = {
  sand:  "Sand",
  loam:  "Lerjord",
  clay:  "Lera",
  silt:  "Silt",
  peat:  "Torv",
  chalk: "Kalk",
};

const SOIL_EMOJIS: Record<SoilType, string> = {
  sand:  "🏖️",
  loam:  "🌍",
  clay:  "🧱",
  silt:  "💧",
  peat:  "🟫",
  chalk: "⬜",
};

const DRAINAGE_LABELS: Record<DrainageType, string> = {
  excellent: "Utmärkt",
  good:      "Bra",
  moderate:  "Måttlig",
  poor:      "Dålig",
};

const DRAINAGE_COLORS: Record<DrainageType, string> = {
  excellent: "text-green-700 bg-green-50 border-green-200",
  good:      "text-green-600 bg-green-50 border-green-100",
  moderate:  "text-amber-700 bg-amber-50 border-amber-200",
  poor:      "text-red-700   bg-red-50   border-red-200",
};

const NUTRIENT_LABELS: Record<NutrientLevel, string> = {
  low:    "Låg",
  medium: "Medel",
  high:   "Hög",
};

const NUTRIENT_COLORS: Record<NutrientLevel, string> = {
  low:    "text-gray-600   bg-gray-50   border-gray-200",
  medium: "text-amber-700  bg-amber-50  border-amber-200",
  high:   "text-green-700  bg-green-50  border-green-200",
};

// ── pH-gauge ──────────────────────────────────────────────────────

/** Visuell pH-skala 0–14 med markerat intervall */
function PhScale({ min, max }: { min: number; max: number }) {
  const pct  = (v: number) => ((v / 14) * 100).toFixed(2);
  const left  = pct(min);
  const width = ((max - min) / 14 * 100).toFixed(2);

  // Färggradient: röd (surt) → grön (neutralt) → lila (basiskt)
  return (
    <div className="mt-3 space-y-1.5">
      {/* Skala */}
      <div className="relative h-4 rounded-full overflow-hidden"
        style={{
          background: "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #22c55e, #3b82f6, #8b5cf6)",
        }}>
        {/* Markerat intervall */}
        <div
          className="absolute top-0 bottom-0 bg-white/30 border-2 border-white rounded-full"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
        {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((v) => (
          <span key={v} className={cn(
            v >= min && v <= max ? "text-green-700 font-semibold" : "",
          )}>
            {v}
          </span>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-300 px-0.5">
        <span>Surt</span>
        <span>Neutralt</span>
        <span>Basiskt</span>
      </div>
    </div>
  );
}

// ── Infokort ──────────────────────────────────────────────────────

function SoilCard({
  icon,
  label,
  children,
}: {
  icon:     React.ReactNode;
  label:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white border border-gray-100 px-5 py-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
        <span className="text-green-600">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

// ── Huvudkomponent ────────────────────────────────────────────────

export function SoilSection({
  ph,
  soilTypes     = [],
  drainage,
  nutrientLevel,
  notes,
  className,
}: SoilSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>

      {/* pH */}
      {ph && (
        <SoilCard icon={<Gauge className="h-5 w-5" />} label="Jord-pH">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              {ph.min}–{ph.max}
            </span>
            <span className="text-sm text-gray-400">pH</span>
          </div>
          <PhScale min={ph.min} max={ph.max} />
        </SoilCard>
      )}

      {/* Jordtyp */}
      {soilTypes.length > 0 && (
        <SoilCard icon={<Layers className="h-5 w-5" />} label="Jordtyp">
          <div className="flex flex-wrap gap-2 mt-1">
            {soilTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-sm font-semibold text-green-800"
              >
                <span className="text-base leading-none">{SOIL_EMOJIS[type]}</span>
                {SOIL_LABELS[type]}
              </span>
            ))}
          </div>
        </SoilCard>
      )}

      {/* Dränering */}
      {drainage && (
        <SoilCard icon={<Droplets className="h-5 w-5" />} label="Dränering">
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border mt-1",
            DRAINAGE_COLORS[drainage],
          )}>
            {DRAINAGE_LABELS[drainage]}
          </span>
        </SoilCard>
      )}

      {/* Näringsnivå */}
      {nutrientLevel && (
        <SoilCard icon={<FlaskConical className="h-5 w-5" />} label="Näringsbehov">
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border mt-1",
            NUTRIENT_COLORS[nutrientLevel],
          )}>
            {NUTRIENT_LABELS[nutrientLevel]}
          </span>
        </SoilCard>
      )}

      {/* Anmärkning */}
      {notes && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm text-amber-800 leading-relaxed">
          <p className="font-semibold text-amber-900 mb-1 text-xs uppercase tracking-wide">Tips</p>
          {notes}
        </div>
      )}
    </div>
  );
}
