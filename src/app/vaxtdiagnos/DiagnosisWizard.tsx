"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload, Camera, X, Loader2, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Leaf, Search, ShoppingBag, BookOpen, Stethoscope,
  RefreshCw, Info, MessageCircle,
} from "lucide-react";
import { HEALTH_SYMPTOMS as SYMPTOMS } from "@/lib/plant-health";
import type { HealthCheckResult } from "@/app/api/health-check/route";

// ── Typer ─────────────────────────────────────────────────────────

interface Plant {
  id:       string;
  name:     string;
  slug:     string;
  latinName: string | null;
}

interface Props {
  plants:  Plant[];
  isMock:  boolean;
}

// ── Steg-indikator ────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const steps = ["Bild & växt", "Symptom", "Analys"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num     = i + 1;
        const done    = step > num;
        const current = step === num;
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`
                h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done    ? "bg-green-600 text-white"       : ""}
                ${current ? "bg-green-600 text-white ring-4 ring-green-100" : ""}
                ${!done && !current ? "bg-gray-100 text-gray-400" : ""}
              `}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : num}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                current ? "text-green-700" : done ? "text-green-600" : "text-gray-400"
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mt-[-14px] sm:mt-[-26px] rounded-full transition-colors ${
                done ? "bg-green-500" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Symptom-chip ──────────────────────────────────────────────────

function SymptomChip({
  label, emoji, selected, onClick,
}: { label: string; emoji: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-sm font-medium transition-all select-none
        ${selected
          ? "bg-green-600 text-white border-green-600 shadow-sm shadow-green-200"
          : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50/50"
        }
      `}
    >
      <span className="text-base leading-none">{emoji}</span>
      {label}
    </button>
  );
}

// ── Resultatkort ──────────────────────────────────────────────────

function ResultCard({
  result, rank, defaultOpen,
}: { result: HealthCheckResult; rank: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const isTop = rank === 1;

  const color =
    result.probability >= 60 ? "green" :
    result.probability >= 35 ? "amber" : "gray";

  return (
    <div className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${
      isTop ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {/* Rank */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
          isTop ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          {rank}
        </div>

        {/* Emoji + label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{result.emoji}</span>
            <span className={`font-bold text-base ${isTop ? "text-gray-900" : "text-gray-700"}`}>
              {result.problemLabel}
            </span>
          </div>

          {/* Sannolikhetsstapel */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  color === "green" ? "bg-green-500" :
                  color === "amber" ? "bg-amber-400" : "bg-gray-300"
                }`}
                style={{ width: `${Math.max(result.probability, 4)}%` }}
              />
            </div>
            <span className={`text-xs font-bold shrink-0 ${
              color === "green" ? "text-green-600" :
              color === "amber" ? "text-amber-600" : "text-gray-400"
            }`}>
              {result.probability}%
            </span>
          </div>
        </div>

        {/* Expand */}
        <div className="shrink-0 text-gray-400">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanderat innehåll */}
      {open && (
        <div className="px-4 pb-5 space-y-5 border-t border-gray-100 pt-4">

          {/* Förklaring */}
          <p className="text-sm text-gray-600 leading-relaxed">{result.explanation}</p>

          {/* Omedelbar åtgärd */}
          <div className="flex gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green-800 mb-0.5">Rekommenderad åtgärd</p>
              <p className="text-sm text-green-700">{result.action}</p>
            </div>
          </div>

          {/* Steg-för-steg */}
          {result.steps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Steg-för-steg
              </p>
              <ol className="space-y-2">
                {result.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Relaterade guider */}
          {result.guides.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Relaterade guider
              </p>
              <div className="flex flex-col gap-2">
                {result.guides.map((g) => (
                  <Link
                    key={g.id}
                    href={`/guider/${g.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition-colors"
                  >
                    {g.imageUrl && (
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                        <Image src={g.imageUrl} alt={g.title} fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 line-clamp-1">{g.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 ml-auto shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rekommenderade produkter */}
          {result.products.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" /> Rekommenderade produkter
              </p>
              <div className="flex flex-col gap-2">
                {result.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/butik/produkt/${p.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition-colors"
                  >
                    {p.imageUrl && (
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 flex-1 line-clamp-1">{p.name}</span>
                    <span className="text-sm font-bold text-green-700 shrink-0">
                      {(p.price / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Primära CTA:er */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
            {result.guides[0] && (
              <Link
                href={`/guider/${result.guides[0].slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Läs mer
              </Link>
            )}
            <Link
              href={`/vaxtdiagnos/ny?problem=${encodeURIComponent(result.problemLabel)}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Fråga communityn
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Huvud-wizard ──────────────────────────────────────────────────

export function DiagnosisWizard({ plants, isMock }: Props) {
  const [step,          setStep]          = useState<1 | 2 | 3>(1);
  const [imageFile,     setImageFile]     = useState<File | null>(null);
  const [imagePreview,  setImagePreview]  = useState<string | null>(null);
  const [dragOver,      setDragOver]      = useState(false);
  const [plantSearch,   setPlantSearch]   = useState("");
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showPlants,    setShowPlants]    = useState(false);
  const [symptoms,      setSymptoms]      = useState<string[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [results,       setResults]       = useState<HealthCheckResult[] | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [resultMock,    setResultMock]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filtrerade växter för sökning
  const filteredPlants = plantSearch.length >= 2
    ? plants.filter(
        (p) =>
          p.name.toLowerCase().includes(plantSearch.toLowerCase()) ||
          (p.latinName?.toLowerCase().includes(plantSearch.toLowerCase()) ?? false)
      ).slice(0, 8)
    : [];

  // ── Bildhantering ──────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) { setError("Välj en bildfil (JPG, PNG, WEBP)."); return; }
    if (f.size > 10 * 1024 * 1024)   { setError("Bilden är för stor (max 10 MB)."); return; }
    setImageFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function toggleSymptom(key: string) {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  // ── Analysera ──────────────────────────────────────────────────

  async function analyse() {
    if (symptoms.length === 0) {
      setError("Välj minst ett symptom för att fortsätta.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    setStep(3);

    try {
      const fd = new FormData();
      if (imageFile) fd.append("image", imageFile);
      fd.append("symptoms", JSON.stringify(symptoms));
      if (selectedPlant) fd.append("plantId", selectedPlant.id);

      const res  = await fetch("/api/health-check", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Något gick fel. Försök igen."); setLoading(false); return; }

      setResults(data.results);
      setResultMock(data.isMock);
    } catch {
      setError("Nätverksfel. Kontrollera din anslutning.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setImageFile(null);
    setImagePreview(null);
    setSelectedPlant(null);
    setPlantSearch("");
    setSymptoms([]);
    setResults(null);
    setError(null);
    setResultMock(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Mock-banner */}
      {isMock && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            <strong>Demoläge</strong> — analysen baseras på dina symptomval, inte AI-bild-analys.
            Aktivera Plant.id i{" "}
            <Link href="/admin/installningar" className="underline font-medium">Admin → Inställningar</Link>.
          </span>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
        Diagnosen är ett förslag baserat på dina symptom – inte en garanti. Vid osäkerhet, kontakta en trädgårdsrådgivare.
      </div>

      <StepBar step={step} />

      {/* ═══════════════════ STEG 1: Bild & växt ═══════════════════ */}
      {step === 1 && (
        <div className="space-y-6">

          {/* Bild-upload */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">
              Foto av växten <span className="text-gray-400 font-normal">(valfritt men ger bättre analys)</span>
            </h2>

            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center gap-3
                  min-h-44 rounded-3xl border-2 border-dashed cursor-pointer
                  transition-all duration-200 select-none
                  ${dragOver
                    ? "border-green-400 bg-green-50 scale-[1.01]"
                    : "border-sage-200 bg-sage-50/50 hover:border-green-300 hover:bg-green-50/50"}
                `}
              >
                <div className="h-12 w-12 rounded-2xl bg-white border border-sage-200 shadow-sm flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center px-4">
                  <p className="font-semibold text-gray-700 text-sm">Ladda upp bild av den sjuka växten</p>
                  <p className="text-xs text-gray-400 mt-1">Dra och släpp, eller klicka · JPG, PNG, WEBP · max 10 MB</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-sage-200 text-xs font-medium text-gray-600 shadow-sm">
                    <Upload className="h-3.5 w-3.5" /> Välj fil
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-sage-200 text-xs font-medium text-gray-600 shadow-sm">
                    <Camera className="h-3.5 w-3.5" /> Ta foto
                  </span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-sage-200 shadow-sm bg-gray-100">
                <div className="relative aspect-[4/3] sm:aspect-[16/7]">
                  <Image src={imagePreview} alt="Vald bild" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-4 text-white text-xs font-medium">{imageFile?.name}</div>
              </div>
            )}
          </div>

          {/* Växtväljare */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">
              Vilken växt är det? <span className="text-gray-400 font-normal">(valfritt)</span>
            </h2>

            {selectedPlant ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-green-200 bg-green-50/50">
                <Leaf className="h-4 w-4 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{selectedPlant.name}</p>
                  {selectedPlant.latinName && (
                    <p className="text-xs text-gray-400 italic">{selectedPlant.latinName}</p>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedPlant(null); setPlantSearch(""); }}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-green-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Sök tomat, gurka, ros…"
                    value={plantSearch}
                    onChange={(e) => { setPlantSearch(e.target.value); setShowPlants(true); }}
                    onFocus={() => setShowPlants(true)}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white"
                  />
                </div>

                {showPlants && filteredPlants.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    {filteredPlants.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setSelectedPlant(p); setPlantSearch(""); setShowPlants(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-left transition-colors"
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

                {showPlants && plantSearch.length >= 2 && filteredPlants.length === 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 text-sm text-gray-400">
                    Ingen växt hittades för &quot;{plantSearch}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={() => { setError(null); setStep(2); }}
            className="w-full py-4 rounded-2xl font-bold text-white text-base bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
          >
            Välj symptom
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ═══════════════════ STEG 2: Symptom ═══════════════════════ */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-gray-900 text-base mb-1">Vad ser du för symptom?</h2>
            <p className="text-sm text-gray-500">Välj ett eller flera symptom som stämmer in.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => (
              <SymptomChip
                key={s.key}
                label={s.label}
                emoji={s.emoji}
                selected={symptoms.includes(s.key)}
                onClick={() => toggleSymptom(s.key)}
              />
            ))}
          </div>

          {symptoms.length > 0 && (
            <p className="text-xs text-green-700 font-medium">
              {symptoms.length} symptom valt{symptoms.length !== 1 ? "a" : ""}
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka
            </button>
            <button
              onClick={analyse}
              disabled={symptoms.length === 0}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white text-base bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
            >
              <Stethoscope className="h-5 w-5" />
              Analysera växt
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════ STEG 3: Resultat ══════════════════════ */}
      {step === 3 && (
        <div className="space-y-5">

          {/* Laddar */}
          {loading && (
            <div className="rounded-3xl border border-sage-100 bg-sage-50/50 p-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-green-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="font-semibold text-gray-700">Analyserar dina symptom…</p>
              <p className="text-sm text-gray-400">Vi matchar symptomen mot möjliga orsaker</p>
            </div>
          )}

          {/* Fel */}
          {error && !loading && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Resultat */}
          {results && !loading && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    Möjliga orsaker
                  </h2>
                  {selectedPlant && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Baserat på: <span className="font-medium">{selectedPlant.name}</span>
                      {" · "}
                      {symptoms.length} symptom
                    </p>
                  )}
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Ny analys
                </button>
              </div>

              {resultMock && (
                <p className="text-xs text-gray-400 px-1">
                  Demo-resultat baserat på symptomval – aktivera Plant.id för bild-analys.
                </p>
              )}

              <div className="space-y-3">
                {results.map((r, i) => (
                  <ResultCard key={r.problemType + i} result={r} rank={i + 1} defaultOpen={i === 0} />
                ))}
              </div>

              {/* Varning */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <p>
                  Resultaten är förslag – inte medicinska diagnoser. Om problemet kvarstår,
                  konsultera en trädgårdsmästare eller lokal odlingskonsult.
                </p>
              </div>

              <button
                onClick={reset}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Gör en ny analys
              </button>
            </>
          )}

          {/* Tillbaka om inget laddar */}
          {!loading && !results && (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka
            </button>
          )}
        </div>
      )}
    </div>
  );
}
