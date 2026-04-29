"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createQuestion } from "@/app/fragor/actions";
import { ImageInput } from "@/components/ui/ImageInput";

interface Props { categories: string[] }

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function NewQuestionForm({ categories }: Props) {
  const [imageUrl,       setImageUrl]       = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function handleSubmit(formData: FormData) {
    if (imageUrl) formData.set("imageUrl", imageUrl);
    start(async () => {
      try {
        await createQuestion(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Titel <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          minLength={10}
          maxLength={200}
          placeholder="T.ex. Varför gulnar mina tomater i växthusets undre del?"
          className={inputClass}
        />
        <p className="text-xs text-gray-400">Formulera frågan tydligt (min 10 tecken)</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Beskrivning <span className="text-red-400">*</span>
        </label>
        <textarea
          name="content"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          placeholder="Beskriv problemet i detalj: Vad har hänt? När? Vilka förhållanden? Vad har du provat?"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Kategori</label>
        <select name="category" className={inputClass}>
          <option value="">Välj kategori</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Bild (valfritt)</label>
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="uploads"
          folder="questions"
        />
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Publicerar...</> : "Publicera fråga"}
      </button>
    </form>
  );
}
