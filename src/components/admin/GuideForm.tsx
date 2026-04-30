"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { createGuide, updateGuide } from "@/app/admin/actions";
import { ImageInput } from "@/components/ui/ImageInput";

const GUIDE_CATEGORIES = [
  "Kom igång", "Grönsaker", "Frukter & bär", "Kryddor & örter",
  "Balkongodling", "Växthus", "Jord & näring", "Skadedjur & sjukdomar",
  "Teknik", "Säsong",
];

const DIFFICULTY_LEVELS = ["Nybörjare", "Lätt", "Medel", "Avancerad"];

interface GuideData {
  id:             string;
  title:          string;
  slug:           string;
  excerpt:        string | null;
  content:        string | null;
  imageUrl:       string | null;
  category:       string | null;
  difficultyLevel: string | null;
  seoTitle:       string | null;
  seoDescription: string | null;
  published:      boolean;
}

interface Props {
  guide?: GuideData; // undefined = create mode
}

const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function GuideForm({ guide }: Props) {
  const isEdit = !!guide;
  const [title,         setTitle]         = useState(guide?.title ?? "");
  const [slug,          setSlug]          = useState(guide?.slug ?? "");
  const [imageUrl,      setImageUrl]      = useState<string | null>(guide?.imageUrl ?? null);
  const [error,         setError]         = useState<string | null>(null);
  const [isPending,     start]            = useTransition();

  function autoSlug(t: string) {
    return t.toLowerCase()
      .replace(/å/g,"a").replace(/ä/g,"a").replace(/ö/g,"o")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  function handleSubmit(formData: FormData) {
    if (imageUrl) formData.set("imageUrl", imageUrl);
    setError(null);
    start(async () => {
      try {
        if (isEdit) await updateGuide(guide.id, formData);
        else        await createGuide(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) setError(err.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Titel + slug */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Titel *</label>
          <input
            name="title" required maxLength={150}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!isEdit) setSlug(autoSlug(e.target.value));
            }}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Slug (URL) *</label>
          <input
            name="slug" required maxLength={100}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${inputCls} font-mono`}
            placeholder="guiden-om-tomater"
          />
        </div>
      </div>

      {/* Kategori + svårighetsgrad */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Kategori</label>
          <select name="category" defaultValue={guide?.category ?? ""} className={inputCls}>
            <option value="">Välj kategori</option>
            {GUIDE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Svårighetsgrad</label>
          <select name="difficultyLevel" defaultValue={guide?.difficultyLevel ?? ""} className={inputCls}>
            <option value="">Välj nivå</option>
            {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Ingress */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Ingress / Excerpt</label>
        <textarea
          name="excerpt" rows={3} maxLength={500}
          defaultValue={guide?.excerpt ?? ""}
          placeholder="Kort sammanfattning som visas i listorna..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Innehåll */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Innehåll (HTML)</label>
        <ContentEditor name="content" defaultValue={guide?.content ?? ""} rows={28} />
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Omslagsbild</label>
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="guide-images"
          folder="guides"
        />
      </div>

      {/* SEO */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO</p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">SEO-titel (max 60 tecken)</label>
          <input name="seoTitle" maxLength={60} defaultValue={guide?.seoTitle ?? ""} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Meta-beskrivning (max 155 tecken)</label>
          <textarea name="seoDescription" rows={2} maxLength={155} defaultValue={guide?.seoDescription ?? ""} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Publicera */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <input type="checkbox" id="published" name="published" value="true"
          defaultChecked={guide?.published ?? true}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-400" />
        <label htmlFor="published" className="text-sm font-medium text-green-800 cursor-pointer">
          Publicera guiden
        </label>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={isPending}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sparar...</> : isEdit ? "Spara ändringar" : "Skapa guide"}
      </button>
    </form>
  );
}
