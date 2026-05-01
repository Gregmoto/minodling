"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ImageInput } from "@/components/ui/ImageInput";

interface PlantFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<PlantDefaults>;
  submitLabel?: string;
}

interface PlantDefaults {
  name: string;
  slug: string;
  latinName: string;
  imageUrl: string;
  category: string;
  difficultyLevel: string;
  sowingPeriod: string;
  plantingPeriod: string;
  harvestPeriod: string;
  sunRequirement: string;
  wateringNeeds: string;
  soilType: string;
  fertilizerNeeds: string;
  soilPreparation: string;
  locationNotes: string;
  commonProblems: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

const CATEGORIES = [
  "Grönsaker", "Rotfrukter", "Örter", "Frukt", "Bär",
  "Blommor", "Lök & vitlök", "Baljväxter", "Sallad & bladgrönt",
];

const DIFFICULTY_OPTIONS = [
  { value: "easy",   label: "Lätt" },
  { value: "medium", label: "Medel" },
  { value: "hard",   label: "Svår" },
];

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";
const textareaClass = `${inputClass} resize-none`;

function Field({
  label, name, hint, required, children,
}: {
  label: string; name?: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 pt-2">
      {children}
    </h3>
  );
}

export function PlantForm({ action, defaultValues = {}, submitLabel = "Spara" }: PlantFormProps) {
  const router = useRouter();
  const [nameValue, setNameValue] = useState(defaultValues.name ?? "");
  const [slugValue, setSlugValue] = useState(defaultValues.slug ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(defaultValues.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setNameValue(val);
    // Auto-generate slug only if not manually edited
    if (!defaultValues.slug) {
      setSlugValue(slugify(val));
    }
  }

  function handleSubmit(formData: FormData) {
    if (imageUrl) formData.set("imageUrl", imageUrl);
    formData.set("slug", slugValue);

    startTransition(async () => {
      try {
        setSaved(false);
        await action(formData);
        // If we're creating a new plant the server action may redirect;
        // for editing it returns normally → show confirmation.
        setSaved(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <SectionTitle>Grundinformation</SectionTitle>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Namn" name="name" required>
          <input
            id="name"
            name="name"
            type="text"
            value={nameValue}
            onChange={handleNameChange}
            required
            maxLength={100}
            placeholder="T.ex. Tomat"
            className={inputClass}
          />
        </Field>

        <Field label="Slug (URL)" name="slug" hint="Används i webbadressen">
          <input
            id="slug"
            name="slug"
            type="text"
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
            required
            maxLength={100}
            placeholder="t-ex-tomat"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Latinskt namn" name="latinName">
          <input
            id="latinName"
            name="latinName"
            type="text"
            defaultValue={defaultValues.latinName ?? ""}
            maxLength={100}
            placeholder="T.ex. Solanum lycopersicum"
            className={inputClass}
          />
        </Field>

        <Field label="Kategori" name="category">
          <select
            id="category"
            name="category"
            defaultValue={defaultValues.category ?? ""}
            className={inputClass}
          >
            <option value="">Välj kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Svårighetsgrad" name="difficultyLevel">
        <div className="flex gap-3">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="difficultyLevel"
                value={opt.value}
                defaultChecked={defaultValues.difficultyLevel === opt.value}
                className="accent-green-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="difficultyLevel"
              value=""
              defaultChecked={!defaultValues.difficultyLevel}
              className="accent-green-600"
            />
            <span className="text-sm text-gray-400">Ingen</span>
          </label>
        </div>
      </Field>

      {/* Bild */}
      <Field label="Bild">
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="plant-images"
          folder="plants"
        />
      </Field>

      <SectionTitle>Odlingstider</SectionTitle>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Såningstid" name="sowingPeriod" hint="T.ex. Feb–Apr inomhus">
          <textarea
            id="sowingPeriod"
            name="sowingPeriod"
            rows={3}
            defaultValue={defaultValues.sowingPeriod ?? ""}
            maxLength={300}
            placeholder="Feb–Apr inomhus, direktså maj"
            className={`${inputClass} resize-none`}
          />
        </Field>
        <Field label="Planteringstid" name="plantingPeriod" hint="T.ex. Maj–Jun utomhus">
          <textarea
            id="plantingPeriod"
            name="plantingPeriod"
            rows={3}
            defaultValue={defaultValues.plantingPeriod ?? ""}
            maxLength={300}
            placeholder="Plantera ut efter sista frost, maj–jun"
            className={`${inputClass} resize-none`}
          />
        </Field>
        <Field label="Skördetid" name="harvestPeriod" hint="T.ex. Aug–sep">
          <textarea
            id="harvestPeriod"
            name="harvestPeriod"
            rows={3}
            defaultValue={defaultValues.harvestPeriod ?? ""}
            maxLength={300}
            placeholder="Aug–okt, skörda löpande"
            className={`${inputClass} resize-none`}
          />
        </Field>
      </div>

      <SectionTitle>Skötselkrav</SectionTitle>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Solbehov" name="sunRequirement">
          <select
            id="sunRequirement"
            name="sunRequirement"
            defaultValue={defaultValues.sunRequirement ?? ""}
            className={inputClass}
          >
            <option value="">Välj</option>
            <option>Full sol (6+ h)</option>
            <option>Halvskugga (3–6 h)</option>
            <option>Skugga (&lt;3 h)</option>
          </select>
        </Field>
        <Field label="Vattenbehov" name="wateringNeeds">
          <select
            id="wateringNeeds"
            name="wateringNeeds"
            defaultValue={defaultValues.wateringNeeds ?? ""}
            className={inputClass}
          >
            <option value="">Välj</option>
            <option>Lågt – tåler torka</option>
            <option>Medel – regelbunden vattning</option>
            <option>Högt – håll fuktig</option>
          </select>
        </Field>
      </div>

      <Field label="Jordtyp" name="soilType">
        <textarea
          id="soilType"
          name="soilType"
          defaultValue={defaultValues.soilType ?? ""}
          rows={4}
          placeholder="T.ex. Mullrik, väldrainerad jord med pH 6–7"
          className={textareaClass}
        />
      </Field>

      <Field label="Gödsling" name="fertilizerNeeds" hint="Beskrivning av gödselbehov">
        <textarea
          id="fertilizerNeeds"
          name="fertilizerNeeds"
          defaultValue={defaultValues.fertilizerNeeds ?? ""}
          rows={3}
          placeholder="T.ex. Kaliumrik gödsel var 2:a vecka under fruktbildning"
          className={textareaClass}
        />
      </Field>

      <Field label="Jordförberedelse" name="soilPreparation" hint="Tips om hur man förbereder jorden inför plantering">
        <textarea
          id="soilPreparation"
          name="soilPreparation"
          defaultValue={defaultValues.soilPreparation ?? ""}
          rows={4}
          placeholder="T.ex. Gräv ned kompost på hösten. Luckra till 30 cm djup. Tillsätt kalk om pH är under 6..."
          className={textareaClass}
        />
      </Field>

      <Field label="Lämplig plats" name="locationNotes" hint="Var passar växten bäst – sol, halvskugga, skyddad plats etc.">
        <textarea
          id="locationNotes"
          name="locationNotes"
          defaultValue={defaultValues.locationNotes ?? ""}
          rows={4}
          placeholder="T.ex. Varm och solig plats skyddad mot vind. Fungerar bra längs husvägg åt söder. Undvik sänkor med frostfickor..."
          className={textareaClass}
        />
      </Field>

      <SectionTitle>Innehåll</SectionTitle>

      <Field label="Beskrivning" name="description" hint="Stöder HTML-formatering">
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues.description ?? ""}
          rows={8}
          placeholder="Fullständig odlingsguide..."
          className={textareaClass}
        />
      </Field>

      <Field label="Vanliga problem" name="commonProblems">
        <textarea
          id="commonProblems"
          name="commonProblems"
          defaultValue={defaultValues.commonProblems ?? ""}
          rows={4}
          placeholder="Beskriv typiska problem och hur man löser dem..."
          className={textareaClass}
        />
      </Field>

      <SectionTitle>SEO</SectionTitle>

      <Field label="SEO-titel" name="seoTitle" hint="Lämna tomt för att auto-generera">
        <input
          id="seoTitle"
          name="seoTitle"
          type="text"
          defaultValue={defaultValues.seoTitle ?? ""}
          maxLength={70}
          placeholder={`Odla ${nameValue || "växtnamn"} – Tips & Guide`}
          className={inputClass}
        />
      </Field>

      <Field label="SEO-beskrivning" name="seoDescription" hint="Max 160 tecken">
        <textarea
          id="seoDescription"
          name="seoDescription"
          defaultValue={defaultValues.seoDescription ?? ""}
          maxLength={160}
          rows={3}
          placeholder={`Allt om att odla ${nameValue || "växtnamn"}. Såningstider, skötsel och tips...`}
          className={textareaClass}
        />
      </Field>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <span className="font-medium">Växten har sparats!</span>
          <a
            href={`/vaxtdatabas/${slugValue}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-green-700 underline hover:text-green-900 text-xs"
          >
            Visa på sidan →
          </a>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
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
