"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Upload, X, Search, Leaf } from "lucide-react";
import { createDiary, uploadDiaryImage } from "@/app/dagbok/actions";

interface PlantOption {
  id:   string;
  name: string;
  slug: string;
}

interface Props {
  plants: PlantOption[];
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function NewDiaryForm({ plants }: Props) {
  const [plantMode,      setPlantMode]      = useState<"database" | "custom">("database");
  const [plantSearch,    setPlantSearch]    = useState("");
  const [selectedPlant,  setSelectedPlant]  = useState<PlantOption | null>(null);
  const [imageUrl,       setImageUrl]       = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError,     setImageError]     = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [isPending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = plants.filter((p) =>
    p.name.toLowerCase().includes(plantSearch.toLowerCase())
  ).slice(0, 8);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setImageUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const result = await uploadDiaryImage(fd);
    setImageUploading(false);
    if (result.error) setImageError(result.error);
    else if (result.url) setImageUrl(result.url);
  }

  function handleSubmit(formData: FormData) {
    if (selectedPlant) formData.set("plantId", selectedPlant.id);
    if (imageUrl) formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        await createDiary(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">

      {/* Välj växt */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Växt <span className="text-red-400">*</span>
        </label>

        {/* Mode-switcher */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setPlantMode("database"); setSelectedPlant(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition-colors ${
              plantMode === "database"
                ? "bg-sage-600 text-white border-sage-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Search className="h-3.5 w-3.5" /> Sök i växtdatabasen
          </button>
          <button
            type="button"
            onClick={() => { setPlantMode("custom"); setSelectedPlant(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition-colors ${
              plantMode === "custom"
                ? "bg-sage-600 text-white border-sage-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Leaf className="h-3.5 w-3.5" /> Ange eget namn
          </button>
        </div>

        {plantMode === "database" ? (
          <div className="space-y-2">
            {selectedPlant ? (
              <div className="flex items-center justify-between px-4 py-3 bg-sage-50 border border-sage-200 rounded-xl">
                <span className="text-sm font-medium text-sage-800">🪴 {selectedPlant.name}</span>
                <button type="button" onClick={() => setSelectedPlant(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={plantSearch}
                    onChange={(e) => setPlantSearch(e.target.value)}
                    placeholder="Sök t.ex. tomat, gurka, basilika..."
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {plantSearch && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    {filtered.length > 0 ? (
                      filtered.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setSelectedPlant(p); setPlantSearch(""); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-sage-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          {p.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-400">Ingen växt hittades — prova eget namn</p>
                    )}
                  </div>
                )}
                {plants.length === 0 && (
                  <p className="text-xs text-gray-400">Inga växter i databasen ännu.</p>
                )}
              </>
            )}
          </div>
        ) : (
          <input
            type="text"
            name="customPlantName"
            required
            maxLength={100}
            placeholder="T.ex. Körsbärstomat, Balkonggurka..."
            className={inputClass}
          />
        )}
      </div>

      {/* Titel */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Dagboksrubrik <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          maxLength={100}
          placeholder="T.ex. Körsbärstomater 2025 – Balkongen"
          className={inputClass}
        />
        <p className="text-xs text-gray-400">Ge dagboken ett beskrivande namn</p>
      </div>

      {/* Datum */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "sowingDate",   label: "🌱 Sådatum" },
          { name: "plantingDate", label: "🪴 Planteringsdatum" },
          { name: "harvestDate",  label: "🌾 Skörddatum (planerat)" },
        ].map(({ name, label }) => (
          <div key={name} className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">{label}</label>
            <input type="date" name={name} className={inputClass} />
          </div>
        ))}
      </div>

      {/* Anteckningar */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Allmänna anteckningar</label>
        <textarea
          name="notes"
          rows={4}
          maxLength={3000}
          placeholder="Sortvarianter, inköpsplats, mål för säsongen..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Omslagsbild */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Omslagsbild (valfritt)</label>
        {imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Omslagsbild" className="max-h-48 rounded-xl border border-gray-200 object-cover" />
            <button
              type="button"
              onClick={() => { setImageUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={imageUploading}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-sage-400 hover:text-sage-600 transition-colors disabled:opacity-50 w-full justify-center"
          >
            {imageUploading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Laddar upp...</>
              : <><Upload className="h-4 w-4" /> Ladda upp bild (max 10 MB)</>}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {imageError && <p className="text-xs text-red-600">{imageError}</p>}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={isPending || imageUploading || (plantMode === "database" && !selectedPlant)}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Skapar...</> : "Skapa dagbok"}
      </button>
    </form>
  );
}
