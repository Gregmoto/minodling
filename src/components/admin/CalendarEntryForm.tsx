"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TASK_TYPES, GROWING_ZONES, GROWING_TYPES, PLANT_CATEGORIES } from "@/lib/calendar";

const MONTHS_SELECT = [
  "Januari","Februari","Mars","April","Maj","Juni",
  "Juli","Augusti","September","Oktober","November","December",
];

interface DefaultValues {
  title?: string;
  month?: number;
  taskType?: string;
  category?: string;
  growingZone?: string;
  growingType?: string;
  description?: string;
  status?: string;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: DefaultValues;
  submitLabel?: string;
  showStatus?: boolean;
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

function Field({ label, name, hint, children }: {
  label: string; name?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function CalendarEntryForm({ action, defaultValues = {}, submitLabel = "Spara", showStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData);
      router.push("/admin/kalender");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Titel *" name="title">
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={defaultValues.title ?? ""}
            required
            maxLength={150}
            placeholder="T.ex. Plantera ut tomater"
            className={inputClass}
          />
        </Field>

        <Field label="Månad *" name="month">
          <select
            id="month"
            name="month"
            defaultValue={defaultValues.month ?? ""}
            required
            className={inputClass}
          >
            <option value="">Välj månad</option>
            {MONTHS_SELECT.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Uppgiftstyp" name="taskType">
          <select id="taskType" name="taskType" defaultValue={defaultValues.taskType ?? ""} className={inputClass}>
            <option value="">Välj typ</option>
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Växtkategori" name="category">
          <select id="category" name="category" defaultValue={defaultValues.category ?? ""} className={inputClass}>
            <option value="">Alla kategorier</option>
            {PLANT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Odlingszon" name="growingZone" hint="Lämna tomt = gäller alla zoner">
          <select id="growingZone" name="growingZone" defaultValue={defaultValues.growingZone ?? ""} className={inputClass}>
            <option value="">Alla zoner</option>
            {GROWING_ZONES.map((z) => (
              <option key={z} value={z}>Zon {z}</option>
            ))}
          </select>
        </Field>

        <Field label="Odlingstyp" name="growingType" hint="Lämna tomt = gäller alla typer">
          <select id="growingType" name="growingType" defaultValue={defaultValues.growingType ?? ""} className={inputClass}>
            <option value="">Alla odlingstyper</option>
            {GROWING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Beskrivning" name="description">
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues.description ?? ""}
          rows={5}
          maxLength={1000}
          placeholder="Detaljerad beskrivning av uppgiften, råd och tips..."
          className={`${inputClass} resize-none`}
        />
      </Field>

      {showStatus && (
        <Field label="Status" name="status">
          <select id="status" name="status" defaultValue={defaultValues.status ?? "published"} className={inputClass}>
            <option value="published">Publicerad</option>
            <option value="pending">Väntar på granskning</option>
            <option value="rejected">Nekad</option>
          </select>
        </Field>
      )}

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50"
        >
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sparar...</> : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
