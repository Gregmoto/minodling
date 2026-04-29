"use client";

import { cn } from "@/lib/utils";
import { Sprout, Leaf, FlowerIcon, Cherry, Wheat } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export type GrowthPhase =
  | "starting"
  | "sprout"
  | "vegetative"
  | "flowering"
  | "harvest";

export interface PhaseData {
  phase:     GrowthPhase;
  /** Dagar som sträng, t.ex. "1", "6–14", "60–100" */
  days:      string;
  /** Valfri anmärkning */
  note?:     string;
}

export interface GrowthTimelineProps {
  phases?: PhaseData[];
  className?: string;
}

// ── Fas-konfiguration ─────────────────────────────────────────────

interface PhaseConfig {
  label:   string;
  icon:    React.ReactNode;
  color:   string;  // ring-color + dot
  bg:      string;  // aktiv bakgrund
  text:    string;  // aktiv text
}

const PHASE_CONFIG: Record<GrowthPhase, PhaseConfig> = {
  starting: {
    label: "Start",
    icon:  <Wheat        className="h-5 w-5" />,
    color: "text-amber-500",
    bg:    "bg-amber-50   border-amber-200",
    text:  "text-amber-700",
  },
  sprout: {
    label: "Groning",
    icon:  <Sprout       className="h-5 w-5" />,
    color: "text-lime-500",
    bg:    "bg-lime-50    border-lime-200",
    text:  "text-lime-700",
  },
  vegetative: {
    label: "Tillväxt",
    icon:  <Leaf         className="h-5 w-5" />,
    color: "text-green-500",
    bg:    "bg-green-50   border-green-200",
    text:  "text-green-700",
  },
  flowering: {
    label: "Blomning",
    icon:  <FlowerIcon   className="h-5 w-5" />,
    color: "text-pink-500",
    bg:    "bg-pink-50    border-pink-200",
    text:  "text-pink-700",
  },
  harvest: {
    label: "Skörd",
    icon:  <Cherry       className="h-5 w-5" />,
    color: "text-harvest-500",
    bg:    "bg-harvest-50 border-harvest-200",
    text:  "text-harvest-700",
  },
};

// Default-faser om inget skickas in
const DEFAULT_PHASES: PhaseData[] = [
  { phase: "starting",   days: "1"       },
  { phase: "sprout",     days: "6–14"    },
  { phase: "vegetative", days: "21–28"   },
  { phase: "flowering",  days: "30–60"   },
  { phase: "harvest",    days: "60–100"  },
];

// ── Komponent ─────────────────────────────────────────────────────

export function GrowthTimeline({
  phases    = DEFAULT_PHASES,
  className,
}: GrowthTimelineProps) {
  return (
    <div className={cn("w-full", className)}>

      {/* ── Desktop / Tablet: horisontell timeline ── */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-[480px] relative">

          {/* Anslutningslinje */}
          <div
            className="absolute top-[22px] left-0 right-0 h-px bg-gray-200 z-0"
            style={{ left: `calc(100% / ${phases.length} / 2)`, right: `calc(100% / ${phases.length} / 2)` }}
          />

          {/* Faser */}
          <div className="relative z-10 flex">
            {phases.map((p, idx) => {
              const cfg = PHASE_CONFIG[p.phase];
              return (
                <div
                  key={p.phase}
                  className="flex-1 flex flex-col items-center gap-3 px-2"
                >
                  {/* Cirkel */}
                  <div className={cn(
                    "h-11 w-11 rounded-full border-2 flex items-center justify-center",
                    "bg-white shadow-sm",
                    cfg.color,
                    "border-current",
                  )}>
                    {cfg.icon}
                  </div>

                  {/* Label + dagar */}
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {cfg.label}
                    </p>
                    <span className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                      cfg.bg, cfg.text,
                    )}>
                      {p.days} dagar
                    </span>
                    {p.note && (
                      <p className="text-[10px] text-gray-400 leading-tight max-w-[90px] mx-auto">
                        {p.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobil: vertikal lista ── */}
      <div className="sm:hidden space-y-0">
        {phases.map((p, idx) => {
          const cfg = PHASE_CONFIG[p.phase];
          const isLast = idx === phases.length - 1;
          return (
            <div key={p.phase} className="flex gap-4">
              {/* Ikon + linje */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0",
                  "bg-white shadow-sm",
                  cfg.color, "border-current",
                )}>
                  {cfg.icon}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-gray-200 my-1 min-h-[16px]" />
                )}
              </div>

              {/* Text */}
              <div className={cn("pb-5", isLast && "pb-0")}>
                <p className="text-sm font-semibold text-gray-800 leading-none mb-1.5 mt-2">
                  {cfg.label}
                </p>
                <span className={cn(
                  "inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                  cfg.bg, cfg.text,
                )}>
                  {p.days} dagar
                </span>
                {p.note && (
                  <p className="mt-1 text-xs text-gray-400">{p.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totaltid */}
      {phases.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Frö → skörd</span>
          <span className="font-medium text-gray-600">
            {/* Beräkna max-dagar från sista fasen */}
            ≈ {(() => {
              const last = phases[phases.length - 1].days;
              const match = last.match(/(\d+)$/);
              return match ? `${match[1]} dagar` : last;
            })()}
          </span>
        </div>
      )}
    </div>
  );
}
