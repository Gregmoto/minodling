"use client";

import { CheckCircle2, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer ─────────────────────────────────────────────────────────

export interface StickyPlantActionsProps {
  isPlanning:    boolean;
  isGrowing:     boolean;
  onPlanToGrow?: () => void;
  onGrowingIt?:  () => void;
  /** Accentfärg för "Jag odlar"-knappen (hex) */
  accentColor?:  string;
  /** Dölj på desktop (sm+). Default: false – syns alltid. */
  mobileOnly?:   boolean;
  className?:    string;
}

// ── Komponent ─────────────────────────────────────────────────────

export function StickyPlantActions({
  isPlanning,
  isGrowing,
  onPlanToGrow,
  onGrowingIt,
  accentColor = "#4f8f4e",
  mobileOnly  = false,
  className,
}: StickyPlantActionsProps) {
  return (
    <div className={cn(
      /* Placering */
      "fixed bottom-0 inset-x-0 z-50",
      /* Bakgrund & ram */
      "bg-white/95 backdrop-blur-md",
      "border-t border-gray-100",
      "shadow-[0_-4px_24px_rgba(0,0,0,0.08)]",
      /* Padding + safe-area för iOS home indicator */
      "px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]",
      /* Dölj på desktop om mobileOnly */
      mobileOnly && "sm:hidden",
      className,
    )}>
      <div className="mx-auto flex max-w-lg gap-3">

        {/* ── Plan to grow – outline ── */}
        <button
          onClick={onPlanToGrow}
          aria-pressed={isPlanning}
          className={cn(
            "flex-1 h-12 rounded-pill text-sm font-semibold",
            "border-2 transition-all duration-150",
            "active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-400",
            "inline-flex items-center justify-center gap-2",
            isPlanning
              ? "bg-green-50 border-green-500 text-green-700"
              : "border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 hover:bg-green-50",
          )}
        >
          {isPlanning && <CheckCircle2 className="h-4 w-4" />}
          {isPlanning ? "Planerad" : "Planera att odla"}
        </button>

        {/* ── Growing it – filled ── */}
        <button
          onClick={onGrowingIt}
          aria-pressed={isGrowing}
          className={cn(
            "flex-1 h-12 rounded-pill text-sm font-semibold text-white",
            "transition-all duration-150",
            "active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-400",
            "inline-flex items-center justify-center gap-2 shadow-sm",
          )}
          style={{
            backgroundColor: isGrowing ? "#1e5450" : accentColor,
            boxShadow:       `0 4px 14px ${accentColor}40`,
          }}
        >
          {isGrowing ? (
            <>
              <Sprout className="h-4 w-4" />
              Odlar den
            </>
          ) : (
            "Jag odlar den"
          )}
        </button>

      </div>
    </div>
  );
}

// ── Spacer (förhindrar att innehåll döljs bakom sticky bar) ───────

export function StickyPlantActionsSpacer({ mobileOnly = false }: { mobileOnly?: boolean }) {
  return (
    <div
      className={cn("h-20 shrink-0", mobileOnly && "sm:hidden")}
      aria-hidden="true"
    />
  );
}
