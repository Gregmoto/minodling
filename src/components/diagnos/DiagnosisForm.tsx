"use client";

import { useState, useTransition } from "react";
import { Loader2, X, Search } from "lucide-react";
import { createDiagnosis } from "@/app/vaxtdiagnos/actions";
import { PROBLEM_TYPES } from "@/app/vaxtdiagnos/constants";
import { ImageInput } from "@/components/ui/ImageInput";

interface Plant { id: string; name: string; slug: string }

interface Props {
  plants: Plant[];
}

const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function DiagnosisForm({ plants }: Props) {
  const [imageUrl,     setImageUrl]     = useState<string | null>(null);
  const [plantSearch,  setPlantSearch]  = useState("");
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [problemType,  setProblemType]  = useState<string>("");
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();

  const filteredPlants = plants.filter((p) =>
    p.name.toLowerCase().includes(plantSearch.toLowerCase())
  ).slice(0, 8);

  function handleSubmit(formData: FormData) {
    if (!imageUrl) { setError("Du måste ladda upp en bild"); return; }
    if (imageUrl)        formData.set("imageUrl", imageUrl);
    if (selectedPlant)   formData.set("plantId", selectedPlant.id);
    if (problemType)     formData.set("problemType", problemType);
    setError(null);
    start(async () => {
      try {
        await createDiagnosis(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) setError(err.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Bild – viktigast */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Bild på problemet *</label>
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="uploads"
          folder="diagnoses"
        />
      </div>

      {/* Problemtyp */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Vad tror du är problemet?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROBLEM_TYPES.map((pt) => (
            <button key={pt.value} type="button"
              onClick={() => setProblemType(pt.value === problemType ? "" : pt.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors text-left ${
                problemType === pt.value
                  ? "border-sage-400 bg-sage-50 text-sage-800 font-medium"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}>
              <span className="text-base">{pt.emoji}</span>
              <span className="leading-tight text-xs">{pt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Beskrivning */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Beskriv problemet *</label>
        <textarea
          name="description" required rows={4} maxLength={1000}
          placeholder="Beskriv vad du ser – hur länge har det pågått, vilka delar av växten påverkas, vad du har provat..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Välj växt */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Vilken växt gäller det?</label>
        {selectedPlant ? (
          <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
            <span className="text-sm font-medium text-green-800">🌱 {selectedPlant.name}</span>
            <button type="button" onClick={() => { setSelectedPlant(null); setPlantSearch(""); }}
              className="text-green-600 hover:text-green-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={plantSearch}
                onChange={(e) => { setPlantSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Sök i växtdatabasen..."
                className={`${inputCls} pl-9`}
              />
            </div>
            {showDropdown && plantSearch && filteredPlants.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {filteredPlants.map((p) => (
                  <button key={p.id} type="button"
                    onMouseDown={() => { setSelectedPlant(p); setPlantSearch(""); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-sage-50 transition-colors">
                    🌱 {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500">Eller skriv eget växtnamn</label>
          <input
            name="plantName"
            placeholder="T.ex. Tomat, Pelargon, Fikus..."
            className={inputCls}
            disabled={!!selectedPlant}
          />
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={isPending || !imageUrl}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Skickar...</> : "Skicka för diagnos"}
      </button>
    </form>
  );
}
