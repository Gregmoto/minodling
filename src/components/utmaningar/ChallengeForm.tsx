"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { createChallenge, updateChallenge } from "@/app/utmaningar/actions";
import { uploadPlantImage } from "@/app/vaxtdatabas/actions";

const CATEGORIES = ["Grönsaker", "Frukter & bär", "Kryddor", "Balkong", "Växthus", "Foto", "Övrigt"];
const STATUSES   = [
  { value: "upcoming", label: "Kommande" },
  { value: "active",   label: "Pågående" },
  { value: "ended",    label: "Avslutad" },
];

interface ChallengeData {
  id: string; title: string; description: string | null; rules: string | null;
  category: string | null; imageUrl: string | null;
  startDate: Date | null; endDate: Date | null;
  status: string; published: boolean;
}

const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function ChallengeForm({ challenge }: { challenge?: ChallengeData }) {
  const isEdit = !!challenge;
  const [imageUrl,     setImageUrl]     = useState<string | null>(challenge?.imageUrl ?? null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError,   setImageError]   = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function toDateInput(d: Date | null) {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 10);
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setImageError(null); setImageLoading(true);
    const fd = new FormData(); fd.append("image", file);
    const r = await uploadPlantImage(fd);
    setImageLoading(false);
    if (r.error) setImageError(r.error);
    else if (r.url) setImageUrl(r.url);
  }

  function handleSubmit(formData: FormData) {
    if (imageUrl) formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        if (isEdit) await updateChallenge(challenge.id, formData);
        else        await createChallenge(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) setError(err.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Titel *</label>
        <input name="title" required maxLength={120} defaultValue={challenge?.title ?? ""} className={inputCls} placeholder="T.ex. Största tomaten 2025" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Kategori</label>
          <select name="category" defaultValue={challenge?.category ?? ""} className={inputCls}>
            <option value="">Välj kategori</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Status</label>
          <select name="status" defaultValue={challenge?.status ?? "upcoming"} className={inputCls}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Startdatum</label>
          <input name="startDate" type="date" defaultValue={toDateInput(challenge?.startDate ?? null)} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Slutdatum</label>
          <input name="endDate" type="date" defaultValue={toDateInput(challenge?.endDate ?? null)} className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Beskrivning</label>
        <textarea name="description" rows={4} maxLength={1000} defaultValue={challenge?.description ?? ""}
          placeholder="Beskriv utmaningen – vad handlar det om och vad mäts?" className={`${inputCls} resize-none`} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Regler</label>
        <textarea name="rules" rows={4} maxLength={1000} defaultValue={challenge?.rules ?? ""}
          placeholder="Vad gäller? T.ex. hur man bidrar, vad som räknas..." className={`${inputCls} resize-none`} />
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Omslagsbild</label>
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

      {/* Publicera */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <input type="checkbox" id="published" name="published" value="true"
          defaultChecked={challenge?.published ?? false}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-400" />
        <label htmlFor="published" className="text-sm font-medium text-green-800 cursor-pointer">
          Publicera utmaningen
        </label>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={isPending || imageLoading}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sparar...</> : isEdit ? "Spara ändringar" : "Skapa utmaning"}
      </button>
    </form>
  );
}
