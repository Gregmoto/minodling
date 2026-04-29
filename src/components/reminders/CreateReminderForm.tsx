"use client";

import { useState, useTransition } from "react";
import { Bell, ChevronDown, Loader2, X, Plus } from "lucide-react";
import { createReminder } from "@/app/paminnelser/actions";

interface PlantOption { id: string; name: string }
interface DiaryOption { id: string; title: string }

interface Props {
  plants:  PlantOption[];
  diaries: DiaryOption[];
  inline?: boolean; // compact inline mode (no card wrapper)
}

const TYPES = [
  { value: "watering",    label: "Vattning",   emoji: "💧" },
  { value: "fertilizing", label: "Gödsling",   emoji: "🌿" },
  { value: "repotting",   label: "Omskolning", emoji: "🪴" },
  { value: "planting",    label: "Plantering", emoji: "🌱" },
  { value: "harvest",     label: "Skörd",      emoji: "🌾" },
  { value: "pruning",     label: "Beskärning", emoji: "✂️" },
  { value: "frost",       label: "Frost",      emoji: "❄️" },
  { value: "sowing",      label: "Ny sådd",    emoji: "🫘" },
];

const REPEATS = [
  { value: "none",      label: "Ingen upprepning" },
  { value: "daily",     label: "Varje dag" },
  { value: "weekly",    label: "Varje vecka" },
  { value: "biweekly",  label: "Var 14:e dag" },
  { value: "monthly",   label: "Varje månad" },
  { value: "yearly",    label: "Varje år" },
];

const inputCls =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white";

export function CreateReminderForm({ plants, diaries, inline = false }: Props) {
  const [open,        setOpen]        = useState(!inline);
  const [type,        setType]        = useState("watering");
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPending,   start]          = useTransition();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  function handleSubmit(formData: FormData) {
    formData.set("reminderType", type);
    setError(null);
    start(async () => {
      try {
        await createReminder(formData);
        setSuccess(true);
        setType("watering");
        setShowAdvanced(false);
        setTimeout(() => {
          setSuccess(false);
          if (inline) setOpen(false);
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  if (inline && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors"
      >
        <Plus className="h-4 w-4" /> Ny påminnelse
      </button>
    );
  }

  return (
    <div className={inline ? "rounded-2xl border border-amber-200 bg-amber-50/30 p-5" : ""}>
      {inline && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-gray-900">Ny påminnelse</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        {/* Typ */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Typ</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  type === t.value
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Titel */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Titel <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            maxLength={100}
            placeholder={`T.ex. Vattna tomaterna`}
            className={inputCls}
          />
        </div>

        {/* Datum */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Datum <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="dueDate"
            required
            defaultValue={defaultDate}
            className={inputCls}
          />
        </div>

        {/* Upprepning */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Upprepning</label>
          <select name="repeatInterval" className={inputCls}>
            {REPEATS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Avancerat */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          {showAdvanced ? "Dölj" : "Fler alternativ"}
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-1 border-t border-gray-100">
            {/* Beskrivning */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notering</label>
              <input
                type="text"
                name="description"
                maxLength={200}
                placeholder="Extra information..."
                className={inputCls}
              />
            </div>

            {/* Koppla till dagbok */}
            {diaries.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Koppla till dagbok</label>
                <select name="diaryId" className={inputCls}>
                  <option value="">Ingen koppling</option>
                  {diaries.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Koppla till växt */}
            {plants.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Koppla till växt</label>
                <select name="plantId" className={inputCls}>
                  <option value="">Ingen koppling</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {error   && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-green-600 font-medium">✓ Påminnelse skapad!</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            {isPending ? "Sparar..." : "Spara påminnelse"}
          </button>
          {inline && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
