"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { updateDiary, deleteDiary } from "@/app/dagbok/actions";
import { ImageInput } from "@/components/ui/ImageInput";

interface DiaryData {
  id:           string;
  title:        string;
  notes:        string | null;
  imageUrl:     string | null;
  sowingDate:   Date | null;
  plantingDate: Date | null;
  harvestDate:  Date | null;
  status:       string;
  isPublic:     boolean;
}

interface Props {
  diary: DiaryData;
}

const STATUS_OPTIONS = [
  { value: "growing",   label: "🌱 Växer" },
  { value: "harvested", label: "🌾 Skördad" },
  { value: "dormant",   label: "💤 Vilar" },
  { value: "failed",    label: "❌ Misslyckades" },
];

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

function toDateInput(d: Date | null) {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

export function EditDiaryForm({ diary }: Props) {
  const [imageUrl,       setImageUrl]       = useState<string | null>(diary.imageUrl);
  const [error,          setError]          = useState<string | null>(null);
  const [isPending,      start]             = useTransition();
  const [deletePending,  startDelete]       = useTransition();

  function handleSubmit(formData: FormData) {
    if (imageUrl) formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        await updateDiary(diary.id, formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">

      {/* Titel */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Rubrik <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          maxLength={100}
          defaultValue={diary.title}
          className={inputClass}
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select name="status" defaultValue={diary.status} className={inputClass}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Datum */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "sowingDate",   label: "🌱 Sådatum",   val: toDateInput(diary.sowingDate) },
          { name: "plantingDate", label: "🪴 Plantering", val: toDateInput(diary.plantingDate) },
          { name: "harvestDate",  label: "🌾 Skörd",      val: toDateInput(diary.harvestDate) },
        ].map(({ name, label, val }) => (
          <div key={name} className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">{label}</label>
            <input type="date" name={name} defaultValue={val} className={inputClass} />
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
          defaultValue={diary.notes ?? ""}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Synlighet */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          value="true"
          defaultChecked={diary.isPublic}
          className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-400"
        />
        <div>
          <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
            Gör dagboken publik
          </label>
          <p className="text-xs text-gray-400">Andra användare kan se din tidslinje (men inte redigera)</p>
        </div>
      </div>

      {/* Omslagsbild */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Omslagsbild</label>
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="diary-images"
          folder="covers"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sparar...</> : "Spara ändringar"}
        </button>

        <button
          type="button"
          disabled={deletePending}
          onClick={() => {
            if (!confirm("Radera hela dagboken? Detta går inte att ångra.")) return;
            startDelete(() => deleteDiary(diary.id));
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deletePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Radera
        </button>
      </div>
    </form>
  );
}
