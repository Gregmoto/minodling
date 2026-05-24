"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload, Camera, Leaf, Loader2, AlertCircle,
  CheckCircle2, ExternalLink, RefreshCw, X, Sprout,
  Droplets, Sun, Shovel, Calendar, BookOpen,
  ShoppingBag, ArrowRight, MessageCircle, LogIn, Lock,
} from "lucide-react";
import type { IdentificationResult } from "@/app/api/identify-plant/route";

interface Props {
  isMock:        boolean;
  isLoggedIn:    boolean;
  usedThisMonth: number;
  limit:         number;
}

// ── Hjälpfunktion: formatera odlingsperiod ────────────────────────

function CalendarBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs text-gray-700 font-medium">{value}</span>
    </div>
  );
}

// ── Utökat resultatkort ───────────────────────────────────────────

function ResultCard({ result, rank }: { result: IdentificationResult; rank: number }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const barWidth = Math.max(result.probability, 3);
  const isTop    = rank === 1;

  const hasCalendar =
    result.dbPlant?.sowingPeriod   ||
    result.dbPlant?.plantingPeriod ||
    result.dbPlant?.harvestPeriod;

  // Namnprioritet: 1) Svenskt namn från DB  2) API-namn  3) Latinsk name
  const displayName    = result.dbPlant?.name ?? result.commonName ?? result.latinName;
  // Visa latinsk namn alltid
  // Visa API-engelskt namn som extra om det skiljer sig från DB-namn
  const apiEnglish = result.commonName && result.commonName !== result.dbPlant?.name
    ? result.commonName
    : null;

  // Bild: API-liknande bild ELLER DB-växtbild
  const plantImage = result.imageUrl ?? result.dbPlant?.imageUrl ?? null;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${
      isTop ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"
    }`}>
      {/* Bild-banner för top-result */}
      {isTop && plantImage && (
        <div className="relative h-48 w-full overflow-hidden bg-sage-100">
          <Image
            src={plantImage}
            alt={displayName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {result.probability >= 70 && (
            <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-600 text-white shadow">
              Bästa träff · {result.probability}%
            </span>
          )}
        </div>
      )}

      <div className="flex gap-4 p-4">

        {/* Rang (ej top) */}
        {!isTop && (
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-bold">
              {rank}
            </div>
          </div>
        )}

        {/* Bild thumbnail för icke-top */}
        {!isTop && plantImage && (
          <div className="shrink-0">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-gray-100">
              <Image
                src={plantImage}
                alt={displayName}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              {/* Primärt namn (svenska om DB-match, annars API, annars latin) */}
              <p className={`font-bold ${isTop ? "text-gray-900 text-lg" : "text-gray-700 text-base"} leading-tight`}>
                {displayName}
              </p>
              {/* Latinsk namn */}
              <p className="text-xs text-gray-400 italic mt-0.5">{result.latinName}</p>
              {/* API-engelskt namn som extra info */}
              {apiEnglish && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Eng: {apiEnglish}
                </p>
              )}
            </div>
            {!isTop && (
              <span className={`text-sm font-bold shrink-0 ${
                result.probability >= 70 ? "text-green-600" :
                result.probability >= 40 ? "text-amber-600" : "text-gray-500"
              }`}>
                {result.probability}%
              </span>
            )}
          </div>

          {/* Sannolikhetsstapel */}
          <div className="mt-2.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                result.probability >= 70 ? "bg-green-500" :
                result.probability >= 40 ? "bg-amber-400" : "bg-gray-300"
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          {/* ── DB-växt: länk och kompakt info ── */}
          {result.dbPlant ? (
            <div className="mt-3 space-y-3">
              {/* Länk till växtsida */}
              <Link
                href={`/vaxtdatabas/${result.dbPlant.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visa {result.dbPlant.name} i växtdatabasen
              </Link>

              {/* Kort beskrivning */}
              {result.dbPlant.description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                  {result.dbPlant.description}
                </p>
              )}

              {/* Snabb-info chips */}
              <div className="flex flex-wrap gap-2">
                {result.dbPlant.wateringNeeds && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs">
                    <Droplets className="h-3 w-3" />
                    {result.dbPlant.wateringNeeds}
                  </span>
                )}
                {result.dbPlant.sunRequirement && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs">
                    <Sun className="h-3 w-3" />
                    {result.dbPlant.sunRequirement}
                  </span>
                )}
                {result.dbPlant.soilType && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50 text-stone-700 text-xs">
                    <Shovel className="h-3 w-3" />
                    {result.dbPlant.soilType}
                  </span>
                )}
              </div>

              {/* Odlingskalender */}
              {hasCalendar && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 mb-2">
                    <Calendar className="h-3 w-3" />
                    Odlingskalender
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {result.dbPlant.sowingPeriod && (
                      <CalendarBadge label="Sådd" value={result.dbPlant.sowingPeriod} />
                    )}
                    {result.dbPlant.plantingPeriod && (
                      <CalendarBadge label="Plantering" value={result.dbPlant.plantingPeriod} />
                    )}
                    {result.dbPlant.harvestPeriod && (
                      <CalendarBadge label="Skörd" value={result.dbPlant.harvestPeriod} />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 mt-3">
              <Leaf className="h-3.5 w-3.5" />
              Inte i vår databas ännu
            </span>
          )}

          {/* ── Relaterade guider ── */}
          {result.guides.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setGuideOpen(!guideOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors mb-2"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {result.guides.length} relaterade guider
              </button>
              {guideOpen && (
                <div className="space-y-1.5">
                  {result.guides.map((g) => (
                    <Link
                      key={g.id}
                      href={`/guider/${g.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition-colors"
                    >
                      {g.imageUrl && (
                        <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0">
                          <Image src={g.imageUrl} alt={g.title} fill className="object-cover" sizes="32px" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-700 flex-1 line-clamp-1">{g.title}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Rekommenderade produkter ── */}
          {result.products.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                Rekommenderade produkter
              </p>
              <div className="space-y-1.5">
                {result.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/butik/produkt/${p.slug}`}
                    className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition-colors"
                  >
                    {p.imageUrl && (
                      <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0">
                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="32px" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 flex-1 line-clamp-1">{p.name}</span>
                    <span className="text-xs font-bold text-green-700 shrink-0">
                      {(p.price / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Fråga communityn ── */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              href={`/vaxtdiagnos/ny?vaxt=${encodeURIComponent(result.commonName ?? result.latinName)}`}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-700 font-medium transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Ser du ett problem? Fråga communityn
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────

export function PlantIdentifier({ isMock, isLoggedIn, usedThisMonth, limit }: Props) {
  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState<IdentificationResult[] | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [used,     setUsed]     = useState(usedThisMonth);
  const fileRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, limit - used);
  const limitReached = isLoggedIn && limit > 0 && remaining === 0;

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) { setError("Välj en bildfil (JPG, PNG, WEBP)."); return; }
    if (f.size > 10 * 1024 * 1024)   { setError("Bilden är för stor. Max 10 MB."); return; }
    setFile(f);
    setError(null);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function reset() {
    setFile(null); setPreview(null); setResults(null);
    setError(null); setProvider("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function identify() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await fetch("/api/identify-plant", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel. Försök igen.");
        if (data.used !== undefined) setUsed(data.used);
        return;
      }
      setResults(data.results);
      setProvider(data.provider);
      if (data.used !== undefined) setUsed(data.used);
    } catch {
      setError("Nätverksfel. Kontrollera din anslutning.");
    } finally {
      setLoading(false);
    }
  }

  // ── Ej inloggad: visa spärr direkt ──────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-green-200 bg-green-50/40 p-10 text-center space-y-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
          <Lock className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">Logga in för att identifiera din växt</p>
          <p className="text-sm text-gray-500 mt-1">
            Du behöver ett konto för att använda AI-identifiering. Det är gratis!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login?redirect=/vaxtidentifiering"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            Logga in
          </Link>
          <Link
            href="/auth/register?redirect=/vaxtidentifiering"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-green-300 text-green-700 font-semibold hover:bg-green-50 transition-colors"
          >
            Skapa konto gratis
          </Link>
        </div>
      </div>
    );
  }

  // ── Limit nådd ───────────────────────────────────────────────────
  if (limitReached) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-10 text-center space-y-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mx-auto">
          <Sprout className="h-7 w-7 text-amber-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">Du har använt dina {limit} gratis sökningar</p>
          <p className="text-sm text-gray-500 mt-1">
            Gränsen återställs nästa månad. Uppgradera till premium för obegränsade sökningar.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/premium"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            Se premium
          </Link>
        </div>
        <p className="text-xs text-gray-400">
          Använt {used} av {limit} sökningar denna månad
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Mock-banner */}
      {isMock && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            <strong>Demoläge</strong> — inga riktiga API-nycklar konfigurerade.
            Resultaten är simulerade. Konfigurera Plant.id eller PlantNet i{" "}
            <Link href="/admin/installningar" className="underline font-medium">Admin → Inställningar</Link>.
          </span>
        </div>
      )}

      {/* Räknare */}
      {limit > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200">
          <span className="text-sm text-gray-600">
            Gratis sökningar denna månad
          </span>
          <span className={`text-sm font-bold tabular-nums ${
            remaining <= 1 ? "text-amber-600" : "text-green-700"
          }`}>
            {remaining} / {limit} kvar
          </span>
        </div>
      )}

      {/* Upload-zon */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-4
            min-h-64 rounded-3xl border-2 border-dashed cursor-pointer
            transition-all duration-200 select-none
            ${dragOver
              ? "border-green-400 bg-green-50 scale-[1.01]"
              : "border-sage-200 bg-sage-50/50 hover:border-green-300 hover:bg-green-50/50"}
          `}
        >
          <div className="h-16 w-16 rounded-2xl bg-white border border-sage-200 shadow-sm flex items-center justify-center">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-center px-4">
            <p className="font-semibold text-gray-700">Ladda upp en bild av din växt</p>
            <p className="text-sm text-gray-400 mt-1">Dra och släpp eller klicka för att välja</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 10 MB</p>
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
            ref={fileRef} type="file" accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-sage-200 shadow-sm bg-gray-100">
          <div className="relative aspect-[4/3] sm:aspect-[16/7]">
            <Image src={preview} alt="Vald bild" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          <button
            onClick={reset}
            className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4 text-white text-sm font-medium">{file?.name}</div>
        </div>
      )}

      {/* Felmeddelande */}
      {error && error !== "limit_reached" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error === "login_required"
            ? "Du måste vara inloggad för att använda AI-identifiering."
            : error}
        </div>
      )}

      {/* Identifiera-knapp */}
      {preview && !results && (
        <button
          onClick={identify}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base bg-green-600 hover:bg-green-700 disabled:opacity-70 transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" />Analyserar bilden…</>
          ) : (
            <><Sprout className="h-5 w-5" />Identifiera växt</>
          )}
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-3xl border border-sage-100 bg-sage-50/50 p-8 text-center space-y-3">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-green-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="font-semibold text-gray-700">Analyserar din bild…</p>
          <p className="text-sm text-gray-400">Vi jämför med tusentals växtarter</p>
        </div>
      )}

      {/* Resultat */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Topp {results.length} möjliga växter
            </h2>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Ny bild
            </button>
          </div>

          {provider === "mock" && (
            <p className="text-xs text-gray-400">
              Demo-resultat — aktivera Plant.id eller PlantNet i admin för riktiga svar.
            </p>
          )}

          <div className="space-y-3">
            {results.map((r, i) => (
              <ResultCard key={i} result={r} rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
