"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Sprout, CheckCircle2 } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export type DifficultyLevel = "easy" | "medium" | "hard";

interface DifficultyConfig {
  score:        number;   // 0–100 för gaugens fill
  label:        string;
  sublabel:     string;
  color:        string;   // stroke-color för arc
  bgColor:      string;   // bakgrundsring
  textColor:    string;
  badgeBg:      string;
  badgeText:    string;
}

const DIFFICULTY: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    score:     28,
    label:     "Lätt",
    sublabel:  "Passar nybörjare",
    color:     "#4CAF50",
    bgColor:   "#E8F5E9",
    textColor: "#2d6b2d",
    badgeBg:   "#E8F5E9",
    badgeText: "#2d6b2d",
  },
  medium: {
    score:     55,
    label:     "Medel",
    sublabel:  "Kräver lite erfarenhet",
    color:     "#f59e0b",
    bgColor:   "#FEF3C7",
    textColor: "#92400e",
    badgeBg:   "#FEF3C7",
    badgeText: "#92400e",
  },
  hard: {
    score:     82,
    label:     "Svår",
    sublabel:  "För erfarna odlare",
    color:     "#ef4444",
    bgColor:   "#FEE2E2",
    textColor: "#991b1b",
    badgeBg:   "#FEE2E2",
    badgeText: "#991b1b",
  },
};

interface DifficultySectionProps {
  difficulty:     DifficultyLevel;
  onPlanToGrow?:  () => void;
  onGrowingIt?:   () => void;
  isPlanning?:    boolean;
  isGrowing?:     boolean;
  className?:     string;
}

// ── SVG-gauge ─────────────────────────────────────────────────────

/** Halvcikel-gauge med SVG arc och strokeDasharray */
function DifficultyGauge({
  score,
  config,
}: {
  score:  number;
  config: DifficultyConfig;
}) {
  const SIZE   = 200;
  const STROKE = 18;
  const R      = (SIZE - STROKE) / 2;   // radie
  const CX     = SIZE / 2;
  const CY     = SIZE / 2 + 12;         // lite lägre så halvcirkeln syns bra

  // Halvcirkelbågen går från 180° till 0° (vänster → höger, övre halva)
  const ARC_LENGTH = Math.PI * R;       // π·r = halvcirkelns längd

  // Idag-position
  const fillLength = (score / 100) * ARC_LENGTH;
  const gap        = ARC_LENGTH - fillLength;

  // SVG arc-path för den övre halvans startpunkt (vänster) till slutpunkt (höger)
  const startX = CX - R;
  const startY = CY;
  const endX   = CX + R;
  const endY   = CY;

  const arcPath = `M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`;

  // Tickmarks vid 0 % (vänster), 50 % (topp), 100 % (höger)
  const ticks = [0, 25, 50, 75, 100].map((pct) => {
    const angle = Math.PI - (pct / 100) * Math.PI; // 180° → 0°
    const tx = CX + R * Math.cos(angle);
    const ty = CY - R * Math.sin(angle);
    return { tx, ty, label: pct === 0 ? "0" : pct === 50 ? "" : pct === 100 ? "100" : "" };
  });

  return (
    <div className="relative flex items-end justify-center" style={{ height: SIZE / 2 + 20 }}>
      <svg
        width={SIZE}
        height={SIZE / 2 + 20}
        viewBox={`0 0 ${SIZE} ${CY + 8}`}
        aria-hidden="true"
        className="overflow-visible">

        {/* Bakgrundsbåge */}
        <path
          d={arcPath}
          fill="none"
          stroke={config.bgColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* Fylld båge (animated) */}
        <path
          d={arcPath}
          fill="none"
          stroke={config.color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${fillLength} ${gap + 1}`}
          strokeDashoffset={0}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34, 1.10, 0.64, 1)" }}
        />

        {/* Nål (cirkel vid slutpositionen) */}
        {(() => {
          const angle = Math.PI - (score / 100) * Math.PI;
          const nx = CX + R * Math.cos(angle);
          const ny = CY - R * Math.sin(angle);
          return (
            <circle
              cx={nx}
              cy={ny}
              r={STROKE / 2 + 2}
              fill="white"
              stroke={config.color}
              strokeWidth={3}
            />
          );
        })()}

        {/* Centrumtext */}
        <text
          x={CX}
          y={CY - 2}
          textAnchor="middle"
          className="font-bold"
          style={{ fontSize: 28, fontWeight: 700, fill: config.textColor, fontFamily: "var(--font-inter)" }}>
          {config.label}
        </text>
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          style={{ fontSize: 11, fill: "#9ca3af", fontFamily: "var(--font-inter)" }}>
          Svårighetsgrad
        </text>

        {/* Ändpunktslabels */}
        <text x={startX - 4} y={CY + 16} textAnchor="end"
          style={{ fontSize: 10, fill: "#d1d5db", fontFamily: "var(--font-inter)" }}>
          Lätt
        </text>
        <text x={endX + 4} y={CY + 16} textAnchor="start"
          style={{ fontSize: 10, fill: "#d1d5db", fontFamily: "var(--font-inter)" }}>
          Svår
        </text>
      </svg>
    </div>
  );
}

// ── Komponent ─────────────────────────────────────────────────────

export function DifficultySection({
  difficulty,
  onPlanToGrow,
  onGrowingIt,
  isPlanning  = false,
  isGrowing   = false,
  className,
}: DifficultySectionProps) {
  const cfg = DIFFICULTY[difficulty];

  return (
    <div className={cn("flex flex-col items-center", className)}>

      {/* Gauge */}
      <DifficultyGauge score={cfg.score} config={cfg} />

      {/* Sublabel */}
      <p className="text-sm text-gray-500 mt-1 mb-6">{cfg.sublabel}</p>

      {/* Egenskaper-chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { label: difficulty === "easy"   ? "Nybörjarvänlig"  : difficulty === "medium" ? "Lite erfarenhet" : "Erfaren odlare", icon: "🌱" },
          { label: difficulty === "hard"   ? "Krävande skötsel" : "Enkel skötsel",         icon: "💧" },
          { label: difficulty === "easy"   ? "Tålig mot fel"   : difficulty === "hard"   ? "Felmarginal liten" : "Viss felmarginal", icon: "✓"  },
        ].map(({ label, icon }) => (
          <span key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}>
            <span>{icon}</span>
            {label}
          </span>
        ))}
      </div>

      {/* ── Knappar ── */}
      {/* Desktop: inline */}
      <div className="hidden sm:flex gap-3 w-full max-w-sm">
        <ActionButtons
          isPlanning={isPlanning}
          isGrowing={isGrowing}
          onPlanToGrow={onPlanToGrow}
          onGrowingIt={onGrowingIt}
          color={cfg.color}
        />
      </div>

      {/* Mobil: sticky bottom */}
      <div className={cn(
        "sm:hidden",
        "fixed bottom-0 inset-x-0 z-40",
        "bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
        "px-4 py-3 pb-safe",
        "flex gap-3",
      )}>
        <ActionButtons
          isPlanning={isPlanning}
          isGrowing={isGrowing}
          onPlanToGrow={onPlanToGrow}
          onGrowingIt={onGrowingIt}
          color={cfg.color}
        />
      </div>

      {/* Spacer på mobil för sticky bar */}
      <div className="sm:hidden h-20" aria-hidden />
    </div>
  );
}

// ── Knappar (delas mellan desktop + mobile sticky) ────────────────

function ActionButtons({
  isPlanning,
  isGrowing,
  onPlanToGrow,
  onGrowingIt,
  color,
}: {
  isPlanning:   boolean;
  isGrowing:    boolean;
  onPlanToGrow?: () => void;
  onGrowingIt?:  () => void;
  color:         string;
}) {
  return (
    <>
      {/* Plan to grow – outline */}
      <button
        onClick={onPlanToGrow}
        className={cn(
          "flex-1 h-12 rounded-pill text-sm font-semibold",
          "border-2 transition-all duration-150 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isPlanning
            ? "bg-green-50 border-green-500 text-green-700"
            : "border-gray-300 text-gray-700 hover:border-green-400 hover:text-green-700 hover:bg-green-50",
        )}>
        <span className="flex items-center justify-center gap-2">
          {isPlanning && <CheckCircle2 className="h-4 w-4" />}
          {isPlanning ? "Planerad" : "Planera att odla"}
        </span>
      </button>

      {/* Growing it – filled */}
      <button
        onClick={onGrowingIt}
        className={cn(
          "flex-1 h-12 rounded-pill text-sm font-semibold text-white",
          "transition-all duration-150 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "shadow-sm flex items-center justify-center gap-2",
          isGrowing ? "opacity-90" : "",
        )}
        style={{
          backgroundColor: isGrowing ? "#2d6b2d" : color,
          boxShadow:       `0 4px 14px ${color}40`,
        }}>
        {isGrowing && <Sprout className="h-4 w-4" />}
        {isGrowing ? "Odlar den" : "Jag odlar den"}
      </button>
    </>
  );
}
