"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { uploadPlantImage } from "@/app/vaxtdatabas/actions";
import { slugify } from "@/lib/utils";

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
  const [imageUrl, setImageUrl] = useState(defaultValues.imageUrl ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setNameValue(val);
    // Auto-generate slug only if not manually edited
    if (!defaultValues.slug) {
      setSlugValue(slugify(val));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setImageError("Max 10 MB"); return; }
    if (!file.type.startsWith("image/")) { setImageError("Endast bilder"); return; }

    setImageError(null);
    setImageUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const result = await uploadPlantImage(fd);
    setImageUploading(false);

    if (result.error) setImageError(result.error);
    else if (result.url) setImageUrl(result.url);
  }

  function handleSubmit(formData: FormData) {
    if (imageUrl) formData.set("imageUrl", imageUrl);
    formData.set("slug", slugValue);

    startTransition(async () => {
      try {
        await action(formData);
        router.push("/admin/vaxter");
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
        <div className="space-y-3">
          {imageUrl ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Växtbild"
                className="max-h-40 rounded-xl border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => { setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-50 w-full justify-center"
            >
              {imageUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Laddar upp...</>
              ) : (
                <><Upload className="h-4 w-4" /> Ladda upp bild (max 10 MB)</>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {imageError && <p className="text-xs text-red-600">{imageError}</p>}
          {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}

          {/* Eller URL direkt */}
          {!imageUrl && (
            <div className="relative">
              <input
                type="url"
                placeholder="Eller klistra in bild-URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </div>
      </Field>

      <SectionTitle>Odlingstider</SectionTitle>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Såningstid" name="sowingPeriod" hint="T.ex. Feb–Apr">
          <input
            id="sowingPeriod"
            name="sowingPeriod"
            type="text"
            defaultValue={defaultValues.sowingPeriod ?? ""}
            maxLength={60}
            placeholder="Feb–Apr"
            className={inputClass}
          />
        </Field>
        <Field label="Planteringstid" name="plantingPeriod" hint="T.ex. Maj–Jun">
          <input
            id="plantingPeriod"
            name="plantingPeriod"
            type="text"
            defaultValue={defaultValues.plantingPeriod ?? ""}
            maxLength={60}
            placeholder="Maj–Jun"
            className={inputClass}
          />
        </Field>
        <Field label="Skördetid" name="harvestPeriod" hint="T.ex. Aug–Sep">
          <input
            id="harvestPeriod"
            name="harvestPeriod"
            type="text"
            defaultValue={defaultValues.harvestPeriod ?? ""}
            maxLength={60}
            placeholder="Aug–Sep"
            className={inputClass}
          />
        </Field>
      </div>

      <SectionTitle>Skötselkrav</SectionTitle>

      <div className="grid sm:grid-cols-3 gap-4">
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
        <Field label="Jordtyp" name="soilType">
          <input
            id="soilType"
            name="soilType"
            type="text"
            defaultValue={defaultValues.soilType ?? ""}
            maxLength={100}
            placeholder="T.ex. Mullrik, väldrainerad"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Gödsling" name="fertilizerNeeds" hint="Beskrivning av gödselbehov">
        <input
          id="fertilizerNeeds"
          name="fertilizerNeeds"
          type="text"
          defaultValue={defaultValues.fertilizerNeeds ?? ""}
          maxLength={200}
          placeholder="T.ex. Kaliumrik gödsel var 2 vecka under fruktbildning"
          className={inputClass}
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

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending || imageUploading}
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
