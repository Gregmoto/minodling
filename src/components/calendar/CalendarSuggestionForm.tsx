"use client";

import { useState, useTransition } from "react";
import { Lightbulb, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { suggestCalendarEntry } from "@/app/odlingskalender/actions";
import { TASK_TYPES, PLANT_CATEGORIES } from "@/lib/calendar";

interface Props {
  defaultMonth?: number;
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

const MONTHS_SELECT = [
  "Januari","Februari","Mars","April","Maj","Juni",
  "Juli","Augusti","September","Oktober","November","December",
];

export function CalendarSuggestionForm({ defaultMonth }: Props) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await suggestCalendarEntry(formData);
        setSuccess(true);
        setOpen(false);
        setTimeout(() => setSuccess(false), 5000);
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-sage-200 bg-sage-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sage-100 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-gray-800 text-sm">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Föreslå ett kalendertips
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {success && (
        <div className="px-5 pb-4 text-sm text-green-700 font-medium">
          ✓ Tack! Ditt förslag har skickats in och väntar på granskning.
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4 border-t border-sage-200 pt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">Titel *</label>
              <input
                name="title"
                type="text"
                required
                minLength={3}
                maxLength={120}
                placeholder="T.ex. Så tomater inomhus"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">Månad *</label>
              <select name="month" defaultValue={defaultMonth ?? ""} required className={inputClass}>
                <option value="">Välj månad</option>
                {MONTHS_SELECT.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">Typ av uppgift</label>
              <select name="taskType" className={inputClass}>
                <option value="">Välj typ</option>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">Växtkategori</label>
              <select name="category" className={inputClass}>
                <option value="">Alla kategorier</option>
                {PLANT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">Beskrivning</label>
            <textarea
              name="description"
              rows={3}
              maxLength={600}
              placeholder="Beskriv vad man bör göra, varför och eventuella tips..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
            {isPending ? "Skickar..." : "Skicka förslag"}
          </button>
          <p className="text-xs text-gray-400">
            Förslaget granskas av en moderator innan det publiceras.
          </p>
        </form>
      )}
    </div>
  );
}
