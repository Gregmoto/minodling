"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { createExchange } from "@/app/frobyte/actions";
import { EXCHANGE_TYPES, CATEGORIES } from "@/app/frobyte/constants";
import { uploadPlantImage } from "@/app/vaxtdatabas/actions";

const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function ExchangeForm() {
  const [exchangeType, setExchangeType] = useState("trade");
  const [imageUrl,     setImageUrl]     = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError,   setImageError]   = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null); setImageLoading(true);
    const fd = new FormData(); fd.append("image", file);
    const r = await uploadPlantImage(fd);
    setImageLoading(false);
    if (r.error) setImageError(r.error);
    else if (r.url) setImageUrl(r.url);
  }

  function handleSubmit(formData: FormData) {
    formData.set("exchangeType", exchangeType);
    if (imageUrl) formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        await createExchange(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) setError(err.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">

      {/* Typ */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Typ av annons *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXCHANGE_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => setExchangeType(t.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                exchangeType === t.value
                  ? "border-sage-400 bg-sage-50 text-sage-800"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}>
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Titel */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Rubrik *</label>
        <input name="title" required maxLength={120}
          placeholder="T.ex. Tomaterfrön San Marzano, Chiliplanta Trinidad Moruga Scorpion..."
          className={inputCls} />
      </div>

      {/* Kategori + Sort */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Kategori</label>
          <select name="category" className={inputCls}>
            <option value="">Välj kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.emoji} {c.value}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Sort / Variant</label>
          <input name="variety" maxLength={80} placeholder="T.ex. San Marzano, Purple Haze..." className={inputCls} />
        </div>
      </div>

      {/* Pris (bara för sell) */}
      {exchangeType === "sell" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Pris (SEK)</label>
          <input name="price" type="number" min="0" max="99999" placeholder="0" className={inputCls} />
        </div>
      )}

      {/* Beskrivning */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Beskrivning</label>
        <textarea name="description" rows={4} maxLength={1000}
          placeholder="Beskriv vad du har – kvantitet, skick, önskad motprestation..."
          className={`${inputCls} resize-none`} />
      </div>

      {/* Plats */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Plats</label>
        <input name="location" maxLength={80} placeholder="T.ex. Stockholm, Göteborg, Skåne..." className={inputCls} />
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Bild (valfri)</label>
        {imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="max-h-48 rounded-xl border border-gray-200 object-cover" />
            <button type="button" onClick={() => { setImageUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50">
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={imageLoading}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-sage-400 hover:text-sage-600 transition-colors disabled:opacity-50 w-full justify-center">
            {imageLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Laddar...</> : <><Upload className="h-4 w-4" /> Ladda upp bild</>}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        {imageError && <p className="text-xs text-red-600">{imageError}</p>}
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={isPending || imageLoading}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Publicerar...</> : "Publicera annons"}
      </button>
    </form>
  );
}
