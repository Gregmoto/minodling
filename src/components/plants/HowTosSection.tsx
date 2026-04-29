"use client";

import { useState } from "react";
import { ChevronDown, Sprout, Leaf, FlowerIcon, Cherry, Wheat, Droplets, Ruler, ArrowDownToLine, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer ─────────────────────────────────────────────────────────

export type HowToPhase =
  | "starting"
  | "seedling"
  | "vegetative"
  | "flowering"
  | "harvest";

export interface HowToMethod {
  id:    string;
  label: string;
  /** Kort beskrivning av metoden */
  description?: string;
}

export interface HowToPhaseData {
  phase:    HowToPhase;
  /** Rekommenderade metoder */
  methods?: HowToMethod[];
  /** Planteringsavstånd, t.ex. "50–100 cm" */
  spacing?: string;
  /** Sådjup, t.ex. "1.9 cm" */
  depth?:   string;
  /** Bevattningsfrekvens, t.ex. "Var 4:e dag" */
  water?:   string;
  /** Fri instruktionstext */
  instructions?: string;
  /** Extra nyckel-värde-par */
  extras?:  { label: string; value: string }[];
}

export interface HowTosSectionProps {
  phases?:    HowToPhaseData[];
  className?: string;
}

// ── Fas-konfiguration ─────────────────────────────────────────────

interface PhaseConfig {
  label:    string;
  icon:     React.ReactNode;
  iconBg:   string;
  iconText: string;
  border:   string;
  headBg:   string;
}

const PHASE_CONFIG: Record<HowToPhase, PhaseConfig> = {
  starting: {
    label:    "Start / Sådd",
    icon:     <Wheat       className="h-4 w-4" />,
    iconBg:   "bg-amber-100",
    iconText: "text-amber-600",
    border:   "border-amber-200",
    headBg:   "hover:bg-amber-50",
  },
  seedling: {
    label:    "Plantor",
    icon:     <Sprout      className="h-4 w-4" />,
    iconBg:   "bg-lime-100",
    iconText: "text-lime-600",
    border:   "border-lime-200",
    headBg:   "hover:bg-lime-50",
  },
  vegetative: {
    label:    "Vegetativ tillväxt",
    icon:     <Leaf        className="h-4 w-4" />,
    iconBg:   "bg-green-100",
    iconText: "text-green-600",
    border:   "border-green-200",
    headBg:   "hover:bg-green-50",
  },
  flowering: {
    label:    "Blomning",
    icon:     <FlowerIcon  className="h-4 w-4" />,
    iconBg:   "bg-pink-100",
    iconText: "text-pink-600",
    border:   "border-pink-200",
    headBg:   "hover:bg-pink-50",
  },
  harvest: {
    label:    "Skörd",
    icon:     <Cherry      className="h-4 w-4" />,
    iconBg:   "bg-harvest-100",
    iconText: "text-harvest-600",
    border:   "border-harvest-200",
    headBg:   "hover:bg-harvest-50",
  },
};

// ── Default-faser om inget skickas in ────────────────────────────

const DEFAULT_PHASES: HowToPhaseData[] = [
  {
    phase: "starting",
    methods: [
      { id: "indoor",    label: "Starta inomhus",  description: "Så 6–8 veckor innan sista frost." },
      { id: "direct",    label: "Direktså utomhus", description: "Så direkt på friland efter frostfri period." },
      { id: "seedlings", label: "Köp plantor",      description: "Plantera ut färdiga plantor i maj–juni." },
    ],
    spacing: "50–100 cm",
    depth:   "1.9 cm",
    water:   "Var 4:e dag",
  },
  {
    phase: "seedling",
    water: "Var 3:e dag",
    instructions: "Håll jorden jämnt fuktig. Tunna ut till ett frö per kruka när 2 riktiga blad syns.",
  },
  {
    phase: "vegetative",
    water: "Var 4:e dag",
    instructions: "Ge extra kväve. Rensa ogräs regelbundet för att minska konkurrens om näring.",
  },
  {
    phase: "flowering",
    water: "Var 3–4 dag",
    instructions: "Undvik att vattna ovanifrån under blomning. Pollinering underlättas av bin.",
  },
  {
    phase: "harvest",
    instructions: "Skörda när frukten har rätt färg och lätt ger efter vid lätt tryck. Skördas morgontid för bäst smak.",
  },
];

// ── Detalj-rad ────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-green-500 shrink-0">{icon}</span>
      <span className="text-xs font-medium text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

// ── Accordion-item ────────────────────────────────────────────────

function PhaseAccordion({
  data,
  isOpen,
  onToggle,
  index,
}: {
  data:     HowToPhaseData;
  isOpen:   boolean;
  onToggle: () => void;
  index:    number;
}) {
  const cfg = PHASE_CONFIG[data.phase];

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-shadow duration-200",
      isOpen ? "shadow-sm" : "shadow-none",
      cfg.border,
    )}>
      {/* Header */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center gap-3 px-5 py-4 text-left",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-inset",
          isOpen ? "bg-white" : `bg-white ${cfg.headBg}`,
        )}
      >
        {/* Nummer + ikon */}
        <span className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl shrink-0",
          cfg.iconBg, cfg.iconText,
        )}>
          {cfg.icon}
        </span>

        {/* Label */}
        <span className="flex-1 text-sm font-semibold text-gray-800">
          {cfg.label}
        </span>

        {/* Steg-nummer */}
        <span className="text-xs text-gray-400 mr-2">Steg {index + 1}</span>

        {/* Pil */}
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0",
          isOpen && "rotate-180",
        )} />
      </button>

      {/* Innehåll */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
      )}>
        <div className="px-5 pb-5 pt-1 bg-white space-y-4">

          {/* Instruktioner */}
          {data.instructions && (
            <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-green-200 pl-3">
              {data.instructions}
            </p>
          )}

          {/* Metoder */}
          {data.methods && data.methods.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Metoder</span>
              </div>
              <div className="space-y-2">
                {data.methods.map((m) => (
                  <div key={m.id} className="flex items-start gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5">
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                      {m.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nyckeltal */}
          {(data.spacing || data.depth || data.water) && (
            <div className="rounded-xl bg-gray-50 px-4 py-1">
              {data.spacing && (
                <DetailRow
                  icon={<Ruler           className="h-3.5 w-3.5" />}
                  label="Avstånd"
                  value={data.spacing}
                />
              )}
              {data.depth && (
                <DetailRow
                  icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
                  label="Sådjup"
                  value={data.depth}
                />
              )}
              {data.water && (
                <DetailRow
                  icon={<Droplets        className="h-3.5 w-3.5" />}
                  label="Vattning"
                  value={data.water}
                />
              )}
              {data.extras?.map((e) => (
                <DetailRow key={e.label} icon={<span className="h-3.5 w-3.5" />} label={e.label} value={e.value} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Huvudkomponent ────────────────────────────────────────────────

export function HowTosSection({ phases = DEFAULT_PHASES, className }: HowTosSectionProps) {
  // Öppna första fasen som default
  const [openPhase, setOpenPhase] = useState<HowToPhase | null>(phases[0]?.phase ?? null);

  function toggle(phase: HowToPhase) {
    setOpenPhase((prev) => (prev === phase ? null : phase));
  }

  return (
    <div className={cn("space-y-2", className)}>
      {phases.map((p, idx) => (
        <PhaseAccordion
          key={p.phase}
          data={p}
          index={idx}
          isOpen={openPhase === p.phase}
          onToggle={() => toggle(p.phase)}
        />
      ))}
    </div>
  );
}
