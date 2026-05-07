"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload, Camera, X, Loader2, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Leaf, Search, ShoppingBag, BookOpen, Stethoscope,
  RefreshCw, Info, MessageCircle, AlertTriangle, Sprout,
  Save, Lock,
} from "lucide-react";
import { HEALTH_SYMPTOMS as SYMPTOMS } from "@/lib/plant-health";
import type { HealthCheckResult } from "@/app/api/health-check/route";

// ── Typer ─────────────────────────────────────────────────────────

interface Plant {
  id:        string;
  name:      string;
  slug:      string;
  latinName: string | null;
}

interface Props {
  plants:     Plant[];
  isMock:     boolean;
  isLoggedIn: boolean;
}

// ── Steg-indikator ────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const steps = [
    { label: "Foto",    icon: Camera },
    { label: "Växt",    icon: Leaf },
    { label: "Symptom", icon: Stethoscope },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map(({ label, icon: Icon }, i) => {
        const num     = i + 1;
        const done    = step > num;
        const current = step === num;
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                h-10 w-10 rounded-full flex items-center justify-center transition-all
                ${done    ? "bg-green-600 text-white" : ""}
                ${current ? "bg-green-600 text-white ring-4 ring-green-100" : ""}
                ${!done && !current ? "bg-gray-100 text-gray-400" : ""}
              `}>
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${
                current ? "text-green-700" : done ? "text-green-600" : "text-gray-400"
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 mb-5 rounded-full transition-colors ${
                done ? "bg-green-500" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Symptom-card ──────────────────────────────────────────────────

function SymptomCard({
  label, emoji, hint, selected, onClick,
}: { label: string; emoji: string; hint?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center
        transition-all duration-150 select-none
        ${selected
          ? "bg-green-50 border-green-500 shadow-sm shadow-green-100"
          : "bg-white border-gray-100 hover:border-green-200 hover:shadow-sm"
        }
      `}
    >
      {selected && (
        <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle2 className="h-3 w-3 text-white" />
        </span>
      )}
      <span className="text-3xl leading-none">{emoji}</span>
      <span className={`text-sm font-semibold leading-tight ${selected ? "text-green-800" : "text-gray-700"}`}>
        {label}
      </span>
      {hint && (
        <span className={`text-[11px] leading-tight ${selected ? "text-green-600" : "text-gray-400"}`}>
          {hint}
        </span>
      )}
    </button>
  );
}

// ── Probability bar ───────────────────────────────────────────────

function ProbabilityBar({ value, color }: { value: number; color: string }) {
  const colors: Record<string, string> = {
    green:  "bg-green-500",
    amber:  "bg-amber-400",
    orange: "bg-orange-500",
    red:    "bg-red-500",
  };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[color] ?? "bg-gray-400"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 w-10 text-right">{value}%</span>
    </div>
  );
}

// ── Resultatkort ──────────────────────────────────────────────────

function ResultCard({
  result, rank, defaultOpen, savedCheckId, isLoggedIn, disclaimer,
}: {
  result:        HealthCheckResult;
  rank:          number;
  defaultOpen:   boolean;
  savedCheckId:  string | null;
  isLoggedIn:    boolean;
  disclaimer:    string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isTop = rank === 1;

  const color =
    result.probability >= 70 ? "green"  :
    result.probability >= 45 ? "amber"  :
    result.probability >= 25 ? "orange" : "red";

  const borderColor =
    isTop && result.probability >= 70 ? "border-green-200 bg-green-50/30" :
    isTop && result.probability >= 45 ? "border-amber-200 bg-amber-50/30" :
    isTop                              ? "border-orange-200 bg-orange-50/20" :
    "border-gray-100 bg-white";

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${borderColor}`}>
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{result.emoji}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900">{result.problemLabel}</h3>
                {isTop && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Mest trolig
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 shrink-0"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        <ProbabilityBar value={result.probability} color={color} />
      </div>

      {/* Expanderat innehåll */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          {/* Förklaring */}
          <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>

          {/* Omedelbar åtgärd */}
          <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-800 mb-0.5">Så hjälper du växten nu</p>
              <p className="text-sm text-green-700">{result.action}</p>
            </div>
          </div>

          {/* Steg-för-steg */}
          {result.steps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Steg-för-steg checklista
              </p>
              <ol className="space-y-2">
                {result.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="h-5 w-5 rounded-full bg-sage-100 text-sage-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Guider */}
          {result.guides.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Relaterade guider
              </p>
              <div className="grid gap-2">
                {result.guides.map((g) => (
                  <Link
                    key={g.id}
                    href={`/guider/${g.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all group"
                  >
                    {g.imageUrl
                      ? <img src={g.imageUrl} alt={g.title} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      : <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><Leaf className="h-4 w-4 text-green-500" /></div>
                    }
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 line-clamp-1 flex-1">
                      {g.title}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-green-500 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Produkter */}
          {result.products.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" /> Rekommenderade produkter
              </p>
              <div className="grid grid-cols-2 gap-2">
                {result.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/butik/produkter/${p.slug}`}
                    className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all group"
                  >
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full aspect-square rounded-lg object-cover" />
                      : <div className="w-full aspect-square rounded-lg bg-gray-50 flex items-center justify-center"><ShoppingBag className="h-6 w-6 text-gray-300" /></div>
                    }
                    <div>
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-green-700 line-clamp-2 leading-tight">{p.name}</p>
                      <p className="text-xs text-green-600 font-bold mt-0.5">{p.price.toFixed(2)} kr</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA-knappar */}
          {isTop && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {isLoggedIn ? (
                savedCheckId ? (
                  <Link
                    href={`/min-odling/vaxtproblem/${savedCheckId}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Sparad – visa i min logg
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Sparad i växtproblem-loggen
                  </div>
                )
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Logga in för att spara diagnosen
                </Link>
              )}
              <Link
                href={`/community?q=${encodeURIComponent(result.problemLabel)}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Fråga communityn
              </Link>
            </div>
          )}

          {/* Disclaimer */}
          {isTop && disclaimer && (
            <div className="flex gap-2 text-[11px] text-gray-400 leading-relaxed">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{disclaimer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Bildinladdare ─────────────────────────────────────────────────

function ImageUploader({ onFile }: { onFile: (f: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed
        cursor-pointer transition-all py-12 px-6
        ${dragOver
          ? "border-green-400 bg-green-50"
          : "border-gray-200 bg-gray-50/50 hover:border-green-300 hover:bg-green-50/30"
        }
      `}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />

      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <Sprout className="h-10 w-10 text-green-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border-2 border-green-200 flex items-center justify-center">
          <Camera className="h-4 w-4 text-green-600" />
        </div>
      </div>

      <div className="text-center">
        <p className="font-semibold text-gray-800">Ta eller ladda upp ett foto</p>
        <p className="text-sm text-gray-500 mt-1">
          Ta en tydlig bild på blad, stam eller hela växten
        </p>
        <p className="text-xs text-gray-400 mt-3">
          JPG, PNG, HEIC · Max 10 MB
        </p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-medium">
          <Camera className="h-3 w-3" /> Ta bild
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 text-xs font-medium">
          <Upload className="h-3 w-3" /> Välj från galleriet
        </span>
      </div>
    </div>
  );
}

// ── Växtväljare ───────────────────────────────────────────────────

function PlantPicker({
  plants, selected, onChange,
}: {
  plants:   Plant[];
  selected: Plant | null;
  onChange: (p: Plant | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);

  const filtered = query.trim().length > 0
    ? plants.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.latinName?.toLowerCase().includes(query.toLowerCase()) ?? false)
      ).slice(0, 8)
    : [];

  if (selected) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-500 bg-green-50">
        <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <Leaf className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
          {selected.latinName && <p className="text-xs text-gray-400 italic">{selected.latinName}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="h-7 w-7 rounded-full hover:bg-green-200 flex items-center justify-center transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5 text-green-700" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Sök växt (t.ex. tomat, basilika…)"
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none text-sm bg-white"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-20 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden mt-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => { onChange(p); setQuery(""); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
            >
              <Leaf className="h-4 w-4 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                {p.latinName && <p className="text-xs text-gray-400 italic">{p.latinName}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hint-texter per symptom ───────────────────────────────────────

const SYMPTOM_HINTS: Record<string, string> = {
  yellow_leaves:   "Gula eller blekgula blad",
  brown_spots:     "Bruna fläckar eller kanter",
  holes_in_leaves: "Hål eller bitmärken",
  drooping:        "Hängande eller slaka blad",
  white_spots:     "Vita pudriga fläckar",
  black_spots:     "Svarta eller mörka fläckar",
  sticky_leaves:   "Klibbig yta på blad",
  dry_edges:       "Torra, krispiga bladkanter",
  slow_growth:     "Verkar inte växa alls",
  visible_pests:   "Insekter, larver eller spindelnät",
};

// ── Huvud-wizard ──────────────────────────────────────────────────

export function DiagnosisWizard({ plants, isMock, isLoggedIn }: Props) {
  const [step,         setStep]         = useState(1);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [plant,        setPlant]        = useState<Plant | null>(null);
  const [skipPlant,    setSkipPlant]    = useState(false);
  const [symptoms,     setSymptoms]     = useState<string[]>([]);
  const [results,      setResults]      = useState<HealthCheckResult[]>([]);
  const [provider,     setProvider]     = useState("");
  const [disclaimer,   setDisclaimer]   = useState("");
  const [savedCheckId, setSavedCheckId] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [limitError,   setLimitError]   = useState<{ used: number; limit: number } | null>(null);

  const handleFile = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep(2);
  };

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const runAnalysis = async () => {
    if (symptoms.length === 0) {
      setError("Välj minst ett symptom.");
      return;
    }
    setLoading(true);
    setError("");
    setLimitError(null);

    try {
      const fd = new FormData();
      if (imageFile) fd.append("image", imageFile);
      fd.append("symptoms", JSON.stringify(symptoms));
      if (plant && !skipPlant) fd.append("plantId", plant.id);

      const res  = await fetch("/api/health-check", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "limit_reached") {
          setLimitError({ used: json.used, limit: json.limit });
          setStep(4);
        } else {
          setError(json.error ?? "Något gick fel.");
        }
        return;
      }

      setResults(json.results ?? []);
      setProvider(json.provider ?? "mock");
      setDisclaimer(json.disclaimer ?? "");
      setSavedCheckId(json.savedCheckId ?? null);
      setStep(4);
    } catch {
      setError("Nätverksfel. Kontrollera din anslutning och försök igen.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setImageFile(null);
    setImagePreview(null);
    setPlant(null);
    setSkipPlant(false);
    setSymptoms([]);
    setResults([]);
    setProvider("");
    setDisclaimer("");
    setSavedCheckId(null);
    setError("");
    setLimitError(null);
  };

  // ── Steg 1: Foto ──────────────────────────────────────────────

  if (step === 1) return (
    <div>
      <StepBar step={1} />
      <h2 className="text-xl font-bold text-gray-900 mb-1">Lägg till ett foto</h2>
      <p className="text-sm text-gray-500 mb-6">
        Foto är valfritt men hjälper AI:n att ge en bättre diagnos.
      </p>
      <ImageUploader onFile={handleFile} />
      <button
        type="button"
        onClick={() => setStep(2)}
        className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
      >
        Fortsätt utan foto →
      </button>
    </div>
  );

  // ── Steg 2: Välj växt ─────────────────────────────────────────

  if (step === 2) return (
    <div>
      <StepBar step={2} />
      <h2 className="text-xl font-bold text-gray-900 mb-1">Vilken växt är det?</h2>
      <p className="text-sm text-gray-500 mb-6">
        Sök i vår växtdatabas eller välj "Jag vet inte".
      </p>

      {imagePreview && (
        <div className="relative mb-6 rounded-2xl overflow-hidden max-h-52 bg-gray-100">
          <img src={imagePreview} alt="Uppladdad bild" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { setImagePreview(null); setImageFile(null); }}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      )}

      <div className="relative space-y-3">
        <PlantPicker
          plants={plants}
          selected={skipPlant ? null : plant}
          onChange={(p) => { setPlant(p); setSkipPlant(false); }}
        />
        <button
          type="button"
          onClick={() => { setSkipPlant(true); setPlant(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
            skipPlant
              ? "border-green-500 bg-green-50 text-green-800"
              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
          }`}
        >
          <span className="text-lg">🌿</span>
          Jag vet inte vilken växt det är
          {skipPlant && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
        </button>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={!plant && !skipPlant}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Välj symptom <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // ── Steg 3: Symptom ───────────────────────────────────────────

  if (step === 3) return (
    <div>
      <StepBar step={3} />
      <h2 className="text-xl font-bold text-gray-900 mb-1">Vad ser du på växten?</h2>
      <p className="text-sm text-gray-500 mb-6">
        Välj alla symptom du kan se — ju fler, desto bättre diagnos.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {SYMPTOMS.map((s) => (
          <SymptomCard
            key={s.key}
            label={s.label}
            emoji={s.emoji}
            hint={SYMPTOM_HINTS[s.key]}
            selected={symptoms.includes(s.key)}
            onClick={() => toggleSymptom(s.key)}
          />
        ))}
      </div>

      {symptoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs text-gray-400">Valda:</span>
          {symptoms.map((k) => {
            const s = SYMPTOMS.find((x) => x.key === k);
            return s ? (
              <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                {s.emoji} {s.label}
              </span>
            ) : null;
          })}
        </div>
      )}

      {error && (
        <div className="flex gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka
        </button>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading || symptoms.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-40"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyserar…</>
            : <><Stethoscope className="h-4 w-4" /> Analysera symptom</>
          }
        </button>
      </div>
    </div>
  );

  // ── Steg 4: Resultat ──────────────────────────────────────────

  if (step === 4) {
    // Gräns nådd
    if (limitError) return (
      <div className="text-center py-10 px-4">
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Månadsgränsen nådd</h3>
        <p className="text-sm text-gray-500 mb-1">
          Du har använt {limitError.used} av {limitError.limit} gratis diagnoser den här månaden.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Uppgradera till premium för fler analyser, full historik och personliga åtgärdsplaner.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/premium"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
          >
            Se premium-planer
          </Link>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> Ny analys
          </button>
        </div>
      </div>
    );

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-gray-900">Din diagnos</h2>
              {provider && provider !== "mock" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  AI · {provider}
                </span>
              )}
              {(!provider || provider === "mock") && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  Demoläge
                </span>
              )}
            </div>
            {plant && !skipPlant && (
              <p className="text-sm text-gray-500">
                Växt: <span className="font-medium text-gray-700">{plant.name}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            title="Ny analys"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Symptom-chips */}
        {symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {symptoms.map((k) => {
              const s = SYMPTOMS.find((x) => x.key === k);
              return s ? (
                <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-50 border border-sage-200 text-sage-700 text-xs font-medium">
                  {s.emoji} {s.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Resultatkort */}
        <div className="space-y-4">
          {results.map((r, i) => (
            <ResultCard
              key={r.problemType}
              result={r}
              rank={i + 1}
              defaultOpen={i === 0}
              savedCheckId={savedCheckId}
              isLoggedIn={isLoggedIn}
              disclaimer={disclaimer}
            />
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-10">
            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Ingen diagnos kunde skapas. Försök igen med fler symptom.</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
