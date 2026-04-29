"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, X, Plus } from "lucide-react";
import { addDiaryEntry } from "@/app/dagbok/actions";
import { ImageInput } from "@/components/ui/ImageInput";

interface Props {
  diaryId: string;
}

export const ENTRY_TYPES = [
  { value: "sowing",       label: "Sådd",        emoji: "🌱", color: "text-lime-600  bg-lime-50  border-lime-200" },
  { value: "planting",     label: "Plantering",   emoji: "🪴", color: "text-green-600 bg-green-50 border-green-200" },
  { value: "harvest",      label: "Skörd",        emoji: "🌾", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "note",         label: "Anteckning",   emoji: "📝", color: "text-blue-600  bg-blue-50  border-blue-200" },
  { value: "observation",  label: "Observation",  emoji: "👁️", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { value: "watering",     label: "Vattning",     emoji: "💧", color: "text-sky-600   bg-sky-50   border-sky-200" },
  { value: "fertilizing",  label: "Gödsling",     emoji: "🌿", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
] as const;

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function DiaryEntryForm({ diaryId }: Props) {
  const [open,           setOpen]           = useState(false);
  const [type,           setType]           = useState("note");
  const [imageUrl,       setImageUrl]       = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState(false);
  const [isPending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(formData: FormData) {
    formData.set("diaryId", diaryId);
    formData.set("type", type);
    if (imageUrl) formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        await addDiaryEntry(formData);
        setImageUrl(null);
        setSuccess(true);
        formRef.current?.reset();
        setTimeout(() => { setSuccess(false); setOpen(false); }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  const selectedType = ENTRY_TYPES.find((t) => t.value === type) ?? ENTRY_TYPES[3];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors"
      >
        <Plus className="h-4 w-4" /> Lägg till händelse
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Ny händelse</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {/* Typ */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Typ</label>
          <div className="flex flex-wrap gap-2">
            {ENTRY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  type === t.value ? t.color : "text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Datum */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Datum</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={today}
            max={today}
            className={inputClass}
          />
        </div>

        {/* Anteckning */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Anteckning</label>
          <textarea
            name="notes"
            rows={3}
            maxLength={2000}
            placeholder={`Beskriv ${selectedType.label.toLowerCase()}en...`}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Bild */}
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="diary-images"
          folder="entries"
        />

        {error   && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-green-600 font-medium">✓ Sparad!</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isPending ? "Sparar..." : "Spara"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}
