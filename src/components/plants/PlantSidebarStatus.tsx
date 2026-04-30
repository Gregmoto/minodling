"use client";

import { useState } from "react";
import { CheckCircle2, Sprout } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Props {
  difficultyLevel?: string | null;
  initialGrowing?: boolean;
  isLoggedIn?: boolean;
}

const DIFFICULTY_COLOR = {
  easy:   { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  label: "⭐ Lätt" },
  medium: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  label: "⭐⭐ Medel" },
  hard:   { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    label: "⭐⭐⭐ Svår" },
};

export function PlantSidebarStatus({ difficultyLevel, initialGrowing = false }: Props) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [isGrowing,  setIsGrowing]  = useState(initialGrowing);

  const diff = difficultyLevel as "easy" | "medium" | "hard" | undefined | null;
  const cfg  = diff ? DIFFICULTY_COLOR[diff] : null;

  return (
    <Card padding="lg">
      {/* Svårighetsgrad + odlingsstatus badges */}
      {(cfg || isGrowing) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {cfg && (
            <div className={`flex-1 min-w-0 rounded-xl px-4 py-3 text-center ${cfg.bg} border ${cfg.border}`}>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Svårighetsgrad</div>
              <div className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</div>
            </div>
          )}
          {isGrowing && (
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 text-center bg-green-600 border border-green-700">
              <div className="text-xs font-medium text-green-100 uppercase tracking-wide mb-1">Status</div>
              <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <Sprout className="h-3.5 w-3.5" /> Odlar denna
              </div>
            </div>
          )}
          {isPlanning && !isGrowing && (
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 text-center bg-blue-50 border border-blue-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
              <div className="text-sm font-bold text-blue-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Planerar odla
              </div>
            </div>
          )}
        </div>
      )}

      {/* Knappar */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setIsPlanning((p) => !p);
            if (!isPlanning) setIsGrowing(false);
          }}
          className={`flex-1 h-10 rounded-xl text-xs font-semibold border-2 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
            isPlanning
              ? "bg-blue-50 border-blue-400 text-blue-700"
              : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50"
          }`}
        >
          {isPlanning && <CheckCircle2 className="h-3.5 w-3.5" />}
          {isPlanning ? "Planerad" : "Planera odla"}
        </button>

        <button
          onClick={() => {
            setIsGrowing((g) => !g);
            if (!isGrowing) setIsPlanning(false);
          }}
          className={`flex-1 h-10 rounded-xl text-xs font-semibold text-white transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-sm ${
            isGrowing
              ? "bg-green-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isGrowing && <Sprout className="h-3.5 w-3.5" />}
          {isGrowing ? "Odlar den ✓" : "Jag odlar den"}
        </button>
      </div>
    </Card>
  );
}
