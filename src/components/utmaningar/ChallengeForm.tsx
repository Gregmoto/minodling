"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createChallenge, updateChallenge } from "@/app/utmaningar/actions";
import { ImageInput } from "@/components/ui/ImageInput";

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
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();

  function toDateInput(d: Date | null) {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 10);
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
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="challenge-images"
          folder="challenges"
        />
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

      <button type="submit" disabled={isPending}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sparar...</> : isEdit ? "Spara ändringar" : "Skapa utmaning"}
      </button>
    </form>
  );
}
