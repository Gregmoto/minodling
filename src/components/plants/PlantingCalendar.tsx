"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Thermometer, Sprout, Info } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export interface CalendarPeriod {
  /** Startmånad 1–12 */
  startMonth: number;
  /** Startdag 1–31 */
  startDay:   number;
  /** Slutmånad 1–12 */
  endMonth:   number;
  /** Slutdag 1–31 */
  endDay:     number;
}

export interface PlantingCalendarProps {
  /** Inomhussådd (grön bar) */
  indoors?:     CalendarPeriod | null;
  /** Utplantering (blå bar) */
  planting?:    CalendarPeriod | null;
  /** Skördefönster (orange bar) */
  harvest?:     CalendarPeriod | null;
  /** Typ av växt, t.ex. "Tomat" */
  plantType?:   string;
  /** Frostkänslig? */
  frostSensitive?: boolean;
  /** Etiketter */
  indoorsLabel?:  string;
  plantingLabel?: string;
  harvestLabel?:  string;
  className?:   string;
}

// ── Konstanter ────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

// ── Hjälpfunktioner ───────────────────────────────────────────────

/** Konverterar (månad 1-12, dag) till ett procent-värde 0–100 längs axeln */
function toPercent(month: number, day: number): number {
  const m   = Math.max(1, Math.min(12, month)) - 1;
  const d   = Math.max(1, Math.min(DAYS_IN_MONTH[m], day));
  const totalDays = DAYS_IN_MONTH.reduce((a, b) => a + b, 0);
  const daysBefore = DAYS_IN_MONTH.slice(0, m).reduce((a, b) => a + b, 0);
  return ((daysBefore + d - 1) / totalDays) * 100;
}

const SV_MONTHS_FULL = [
  "januari","februari","mars","april","maj","juni",
  "juli","augusti","september","oktober","november","december",
];

function formatDateLabel(month: number, day: number): string {
  return `${day} ${SV_MONTHS_FULL[month - 1]?.slice(0, 3) ?? ""}`;
}

// ── Komponent ─────────────────────────────────────────────────────

export function PlantingCalendar({
  indoors,
  planting,
  harvest,
  plantType,
  frostSensitive = false,
  indoorsLabel   = "Inomhussådd",
  plantingLabel  = "Utplantering",
  harvestLabel   = "Skörd",
  className,
}: PlantingCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number; label: string; sublabel: string; color: string;
  } | null>(null);

  // Beräkna vart "idag" hamnar
  const todayPct = useMemo(() => {
    const now = new Date();
    return toPercent(now.getMonth() + 1, now.getDate());
  }, []);

  // Beräkna bar-positioner
  const indoorsBar = useMemo(() => {
    if (!indoors) return null;
    const left  = toPercent(indoors.startMonth, indoors.startDay);
    const right = toPercent(indoors.endMonth,   indoors.endDay);
    return { left, width: right - left };
  }, [indoors]);

  const plantingBar = useMemo(() => {
    if (!planting) return null;
    const left  = toPercent(planting.startMonth, planting.startDay);
    const right = toPercent(planting.endMonth,   planting.endDay);
    return { left, width: right - left };
  }, [planting]);

  const harvestBar = useMemo(() => {
    if (!harvest) return null;
    const left  = toPercent(harvest.startMonth, harvest.startDay);
    const right = toPercent(harvest.endMonth,   harvest.endDay);
    return { left, width: right - left };
  }, [harvest]);

  const hasData = indoorsBar || plantingBar || harvestBar;

  return (
    <div className={cn("w-full", className)}>

      {/* Info-rad */}
      {(plantType || frostSensitive) && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {plantType && (
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Sprout className="h-4 w-4 text-green-500" />
              {plantType}
            </span>
          )}
          {frostSensitive && (
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
              <Thermometer className="h-3.5 w-3.5" />
              Frostkänslig
            </span>
          )}
        </div>
      )}

      {/* Chart */}
      <div
        ref={containerRef}
        className="relative w-full select-none"
        onMouseLeave={() => setTooltip(null)}>

        {/* Månadsrubriker */}
        <div className="flex mb-2">
          {MONTHS.map((m, i) => (
            <div key={m}
              className="flex-1 text-center text-[10px] font-medium text-gray-400 tracking-wide uppercase">
              {m}
            </div>
          ))}
        </div>

        {/* Grid + bars */}
        <div className="relative rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">

          {/* Vertikala gridlinjer */}
          <div className="absolute inset-0 flex pointer-events-none">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex-1 border-r border-gray-100 last:border-r-0" />
            ))}
          </div>

          {/* Alternating månad-bakgrunder */}
          <div className="absolute inset-0 flex pointer-events-none">
            {MONTHS.map((_, i) => (
              <div key={i} className={cn("flex-1", i % 2 === 0 ? "bg-transparent" : "bg-gray-50/80")} />
            ))}
          </div>

          {/* Bar-område */}
          <div className="relative px-0 py-5 space-y-3">

            {/* Inomhus-bar */}
            {indoorsBar && indoors && (
              <div className="relative h-8">
                <div
                  className={cn(
                    "absolute top-0 h-full",
                    "bg-gradient-to-r from-green-400 to-green-500",
                    "rounded-full shadow-sm",
                    "flex items-center justify-center",
                    "cursor-pointer transition-opacity hover:opacity-90",
                    "group",
                  )}
                  style={{ left: `${indoorsBar.left}%`, width: `${indoorsBar.width}%` }}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    const elRect = e.currentTarget.getBoundingClientRect();
                    if (!rect) return;
                    setTooltip({
                      x:        elRect.left + elRect.width / 2 - rect.left,
                      label:    indoorsLabel,
                      sublabel: `${formatDateLabel(indoors.startMonth, indoors.startDay)} – ${formatDateLabel(indoors.endMonth, indoors.endDay)}`,
                      color:    "green",
                    });
                  }}>
                  {/* Inline label om bar är bred nog */}
                  {indoorsBar.width > 12 && (
                    <span className="text-[10px] font-semibold text-white truncate px-2 pointer-events-none">
                      {formatDateLabel(indoors.startMonth, indoors.startDay)} – {formatDateLabel(indoors.endMonth, indoors.endDay)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Utplantering-bar (blå) */}
            {plantingBar && planting && (
              <div className="relative h-8">
                <div
                  className={cn(
                    "absolute top-0 h-full",
                    "bg-gradient-to-r from-blue-400 to-blue-500",
                    "rounded-full shadow-sm",
                    "flex items-center justify-center",
                    "cursor-pointer transition-opacity hover:opacity-90",
                  )}
                  style={{ left: `${plantingBar.left}%`, width: `${plantingBar.width}%` }}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    const elRect = e.currentTarget.getBoundingClientRect();
                    if (!rect) return;
                    setTooltip({
                      x:        elRect.left + elRect.width / 2 - rect.left,
                      label:    plantingLabel,
                      sublabel: `${formatDateLabel(planting.startMonth, planting.startDay)} – ${formatDateLabel(planting.endMonth, planting.endDay)}`,
                      color:    "blue",
                    });
                  }}>
                  {plantingBar.width > 12 && (
                    <span className="text-[10px] font-semibold text-white truncate px-2 pointer-events-none">
                      {formatDateLabel(planting.startMonth, planting.startDay)} – {formatDateLabel(planting.endMonth, planting.endDay)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Harvest-bar */}
            {harvestBar && harvest && (
              <div className="relative h-8">
                <div
                  className={cn(
                    "absolute top-0 h-full",
                    "bg-gradient-to-r from-harvest-400 to-harvest-500",
                    "rounded-full shadow-sm",
                    "flex items-center justify-center",
                    "cursor-pointer transition-opacity hover:opacity-90",
                  )}
                  style={{ left: `${harvestBar.left}%`, width: `${harvestBar.width}%` }}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    const elRect = e.currentTarget.getBoundingClientRect();
                    if (!rect) return;
                    setTooltip({
                      x:        elRect.left + elRect.width / 2 - rect.left,
                      label:    harvestLabel,
                      sublabel: `${formatDateLabel(harvest.startMonth, harvest.startDay)} – ${formatDateLabel(harvest.endMonth, harvest.endDay)}`,
                      color:    "harvest",
                    });
                  }}>
                  {harvestBar.width > 12 && (
                    <span className="text-[10px] font-semibold text-white truncate px-2 pointer-events-none">
                      {formatDateLabel(harvest.startMonth, harvest.startDay)} – {formatDateLabel(harvest.endMonth, harvest.endDay)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {!hasData && (
              <div className="flex items-center justify-center h-16 text-sm text-gray-400 gap-2">
                <Info className="h-4 w-4" />
                Ingen kalenderdata tillgänglig
              </div>
            )}
          </div>

          {/* Dagens datum – vertikal linje */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-400 z-20 pointer-events-none"
            style={{ left: `${todayPct}%` }}>
            {/* Triangel-markör */}
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-0 h-0
              border-l-[5px] border-l-transparent
              border-r-[5px] border-r-transparent
              border-t-[6px] border-t-red-400" />
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-30 pointer-events-none -translate-x-1/2 mt-2"
            style={{ left: tooltip.x, top: "100%" }}>
            <div className={cn(
              "rounded-xl border shadow-card px-3 py-2 text-xs whitespace-nowrap",
              tooltip.color === "green"
                ? "bg-green-600 border-green-500 text-white"
                : tooltip.color === "blue"
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-harvest-500 border-harvest-400 text-white",
            )}>
              <p className="font-semibold">{tooltip.label}</p>
              <p className="opacity-85">{tooltip.sublabel}</p>
            </div>
            {/* Pil uppåt */}
            <div className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0",
              "border-l-[6px] border-l-transparent",
              "border-r-[6px] border-r-transparent",
              tooltip.color === "green"
                ? "border-b-[6px] border-b-green-600"
                : tooltip.color === "blue"
                ? "border-b-[6px] border-b-blue-600"
                : "border-b-[6px] border-b-harvest-500",
            )} />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-gray-100">
        {indoors && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-sm" />
            <span className="text-xs text-gray-600">{indoorsLabel}</span>
          </div>
        )}
        {planting && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-sm" />
            <span className="text-xs text-gray-600">{plantingLabel}</span>
          </div>
        )}
        {harvest && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-8 rounded-full bg-gradient-to-r from-harvest-400 to-harvest-500 shadow-sm" />
            <span className="text-xs text-gray-600">{harvestLabel}</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="h-3 w-px bg-red-400" />
          <span className="text-xs text-gray-400">Idag</span>
        </div>
      </div>
    </div>
  );
}
