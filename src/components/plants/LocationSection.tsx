"use client";

import { cn } from "@/lib/utils";
import { Snowflake, Thermometer, Sun, CircleDot } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export type SunlightLevel =
  | "full-sun"
  | "partial-sun"
  | "partial-shade"
  | "full-shade";

export interface Neighbor {
  name:     string;
  imageUrl?: string | null;
  emoji?:   string;
}

export interface LocationSectionProps {
  /** Härdighetszon, t.ex. { min: 2, max: 10 } */
  hardinessZone?: { min: number; max: number } | null;
  /** Temperaturintervall i °C */
  temperature?:   { min: number; max: number } | null;
  /** Solljusbehov – en eller flera */
  sunlight?:      SunlightLevel[];
  /** Bra grannväxter */
  goodNeighbors?: Neighbor[];
  /** Dåliga grannväxter */
  badNeighbors?:  Neighbor[];
  className?:     string;
}

// ── Hjälp ─────────────────────────────────────────────────────────

const SUNLIGHT_LABELS: Record<SunlightLevel, string> = {
  "full-sun":      "Full sol",
  "partial-sun":   "Halvskugga",
  "partial-shade": "Skugga",
  "full-shade":    "Djup skugga",
};

const SUNLIGHT_ICONS: Record<SunlightLevel, string> = {
  "full-sun":      "☀️",
  "partial-sun":   "⛅",
  "partial-shade": "🌥️",
  "full-shade":    "☁️",
};

// ── Infokort ──────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  children,
  className,
}: {
  icon:      React.ReactNode;
  label:     string;
  children:  React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-start gap-4 rounded-2xl bg-white border border-gray-100",
      "px-5 py-4 shadow-sm",
      className,
    )}>
      {/* Ikonbakgrund */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
        <span className="text-green-600">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

// ── Grannnkort (bild eller emoji fallback) ────────────────────────

function NeighborCard({ neighbor }: { neighbor: Neighbor }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-[72px]">
      {neighbor.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={neighbor.imageUrl}
          alt={neighbor.name}
          className="h-14 w-14 rounded-xl object-cover border border-gray-100 shadow-sm"
        />
      ) : (
        <div className="h-14 w-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shadow-sm">
          {neighbor.emoji ?? "🌿"}
        </div>
      )}
      <span className="text-[11px] text-gray-600 font-medium text-center leading-tight line-clamp-2">
        {neighbor.name}
      </span>
    </div>
  );
}

// ── Huvudkomponent ────────────────────────────────────────────────

export function LocationSection({
  hardinessZone,
  temperature,
  sunlight      = [],
  goodNeighbors = [],
  badNeighbors  = [],
  className,
}: LocationSectionProps) {
  const hasNeighbors = goodNeighbors.length > 0 || badNeighbors.length > 0;

  return (
    <div className={cn("space-y-8", className)}>

      {/* ── Miljökort ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {/* Härdighetszon */}
        {hardinessZone && (
          <InfoCard icon={<Snowflake className="h-5 w-5" />} label="Härdighetszon">
            <p className="text-xl font-bold text-gray-900 leading-tight">
              {hardinessZone.min}–{hardinessZone.max}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">USDA hardiness zone</p>
          </InfoCard>
        )}

        {/* Temperatur */}
        {temperature && (
          <InfoCard icon={<Thermometer className="h-5 w-5" />} label="Temperatur">
            <p className="text-xl font-bold text-gray-900 leading-tight">
              {temperature.min}–{temperature.max}°C
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Optimal odlingstemperatur</p>
          </InfoCard>
        )}

        {/* Solljus */}
        {sunlight.length > 0 && (
          <InfoCard icon={<Sun className="h-5 w-5" />} label="Solljus">
            <div className="flex flex-col gap-1 mt-0.5">
              {sunlight.map((level) => (
                <div key={level} className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{SUNLIGHT_ICONS[level]}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {SUNLIGHT_LABELS[level]}
                  </span>
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>

      {/* ── Grannväxter ── */}
      {hasNeighbors && (
        <div className="space-y-6">

          {goodNeighbors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CircleDot className="h-4 w-4 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-800">Bra grannväxter</h3>
                <span className="text-xs text-gray-400">
                  ({goodNeighbors.length} {goodNeighbors.length === 1 ? "växt" : "växter"})
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                {goodNeighbors.map((n) => (
                  <NeighborCard key={n.name} neighbor={n} />
                ))}
              </div>
            </div>
          )}

          {badNeighbors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* Röd cirkel */}
                <CircleDot className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-gray-800">Dåliga grannväxter</h3>
                <span className="text-xs text-gray-400">
                  ({badNeighbors.length} {badNeighbors.length === 1 ? "växt" : "växter"})
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                {badNeighbors.map((n) => (
                  <NeighborCard key={n.name} neighbor={n} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
