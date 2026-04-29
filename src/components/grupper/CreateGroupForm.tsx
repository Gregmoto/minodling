"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Upload, X, MapPin, Tag } from "lucide-react";
import { createGroup } from "@/app/grupper/actions";
import { uploadPlantImage } from "@/app/vaxtdatabas/actions";

const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function CreateGroupForm() {
  const [category,     setCategory]     = useState<"region" | "interest">("interest");
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
    formData.set("category", category);
    if (imageUrl) formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        await createGroup(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) setError(err.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Typ */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Typ av grupp *</label>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setCategory("region")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
              category === "region" ? "border-blue-400 bg-blue-50 text-blue-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}>
            <MapPin className="h-6 w-6" />
            <span className="text-sm font-medium">Regionbaserad</span>
            <span className="text-xs text-center opacity-70">Odlare i ett specifikt område</span>
          </button>
          <button type="button" onClick={() => setCategory("interest")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
              category === "interest" ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}>
            <Tag className="h-6 w-6" />
            <span className="text-sm font-medium">Intressebaserad</span>
            <span className="text-xs text-center opacity-70">Kring en odlingsinriktning</span>
          </button>
        </div>
      </div>

      {/* Namn */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Gruppnamn *</label>
        <input
          name="name" required maxLength={100}
          placeholder={category === "region" ? "T.ex. Odlare i Stockholm" : "T.ex. Tomatälskare"}
          className={inputCls}
        />
      </div>

      {/* Plats (bara för region) */}
      {category === "region" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Ort / Region</label>
          <input name="location" maxLength={100} placeholder="T.ex. Stockholm, Skåne, Göteborg..." className={inputCls} />
        </div>
      )}

      {/* Beskrivning */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Beskrivning</label>
        <textarea
          name="description" rows={3} maxLength={500}
          placeholder="Beskriv gruppen – vem passar den för och vad pratar ni om?"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Synlighet */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Synlighet</label>
        <select name="groupType" className={inputCls}>
          <option value="public">Öppen – vem som helst kan gå med</option>
          <option value="private">Privat – kräver godkännande</option>
        </select>
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Omslagsbild (valfri)</label>
        {imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="max-h-40 rounded-xl border border-gray-200 object-cover" />
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
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Skapar...</> : "Skapa grupp"}
      </button>
    </form>
  );
}
