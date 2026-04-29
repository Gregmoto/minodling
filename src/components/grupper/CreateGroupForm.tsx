"use client";

import { useState, useTransition } from "react";
import { Loader2, MapPin, Tag } from "lucide-react";
import { createGroup } from "@/app/grupper/actions";
import { ImageInput } from "@/components/ui/ImageInput";

const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function CreateGroupForm() {
  const [category,     setCategory]     = useState<"region" | "interest">("interest");
  const [imageUrl,     setImageUrl]     = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();

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
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="guide-images"
          folder="groups"
        />
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={isPending}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Skapar...</> : "Skapa grupp"}
      </button>
    </form>
  );
}
