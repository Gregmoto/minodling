"use client";

import { useState, useTransition } from "react";
import { Bell, Loader2, X, Plus } from "lucide-react";
import { addReminder } from "@/app/dagbok/actions";

interface Props {
  diaryId: string;
}

const REMINDER_TYPES = [
  { value: "watering",    label: "Vattning",   emoji: "💧" },
  { value: "fertilizing", label: "Gödsling",   emoji: "🌿" },
  { value: "pruning",     label: "Beskärning", emoji: "✂️" },
  { value: "harvest",     label: "Skörd",      emoji: "🌾" },
  { value: "custom",      label: "Annat",      emoji: "📌" },
];

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function ReminderForm({ diaryId }: Props) {
  const [open,      setOpen]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [isPending, start]        = useTransition();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  function handleSubmit(formData: FormData) {
    formData.set("diaryId", diaryId);
    setError(null);
    start(async () => {
      try {
        await addReminder(formData);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setOpen(false); }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Lägg till påminnelse
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-600" />
          <h4 className="text-sm font-semibold text-gray-900">Ny påminnelse</h4>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <form action={handleSubmit} className="space-y-3">
        {/* Typ */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Typ</label>
          <div className="flex flex-wrap gap-1.5">
            {REMINDER_TYPES.map((t) => (
              <label key={t.value} className="cursor-pointer">
                <input type="radio" name="reminderType" value={t.value} defaultChecked={t.value === "custom"} className="sr-only peer" />
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 peer-checked:bg-amber-600 peer-checked:text-white peer-checked:border-amber-600 transition-colors">
                  {t.emoji} {t.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Titel */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Titel</label>
          <input
            type="text"
            name="title"
            required
            maxLength={100}
            placeholder="T.ex. Vattna tomaterna"
            className={inputClass}
          />
        </div>

        {/* Datum */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Påminn mig</label>
          <input
            type="date"
            name="dueDate"
            required
            min={minDate}
            defaultValue={minDate}
            className={inputClass}
          />
        </div>

        {/* Beskrivning (valfritt) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notering (valfritt)</label>
          <input
            type="text"
            name="description"
            maxLength={200}
            placeholder="Extra info..."
            className={inputClass}
          />
        </div>

        {error   && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-green-600 font-medium">✓ Påminnelse sparad!</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
            {isPending ? "Sparar..." : "Spara"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}
