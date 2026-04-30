"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { createArticle, updateArticle } from "@/app/admin/actions";
import { ImageInput } from "@/components/ui/ImageInput";

const KNOWLEDGE_CATEGORIES = [
  "Jord", "Gödsel", "Kompost", "Bevattning", "Skadedjur",
  "Sjukdomar", "Växtbelysning", "Växthus", "Frösådd", "Beskärning", "Skörd och förvaring",
];

interface ArticleData {
  id:             string;
  title:          string;
  slug:           string;
  excerpt:        string | null;
  content:        string | null;
  imageUrl:       string | null;
  category:       string | null;
  seoTitle:       string | null;
  seoDescription: string | null;
  published:      boolean;
}

interface Props {
  article?: ArticleData;
}

const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

export function ArticleForm({ article }: Props) {
  const isEdit = !!article;
  const [title,        setTitle]        = useState(article?.title ?? "");
  const [slug,         setSlug]         = useState(article?.slug ?? "");
  const [imageUrl,     setImageUrl]     = useState<string | null>(article?.imageUrl ?? null);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();

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
        if (isEdit) await updateArticle(article.id, formData);
        else        await createArticle(formData);
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
            placeholder="om-jord-och-substrat"
          />
        </div>
      </div>

      {/* Kategori */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Kategori</label>
        <select name="category" defaultValue={article?.category ?? ""} className={inputCls}>
          <option value="">Välj kategori</option>
          {KNOWLEDGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Ingress */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Ingress / Excerpt</label>
        <textarea name="excerpt" rows={3} maxLength={500}
          defaultValue={article?.excerpt ?? ""}
          placeholder="Kort sammanfattning..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Innehåll */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Innehåll (HTML)</label>
        <ContentEditor name="content" defaultValue={article?.content ?? ""} rows={28} />
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Omslagsbild</label>
        <ImageInput
          value={imageUrl}
          onChange={setImageUrl}
          name="imageUrl"
          bucket="guide-images"
          folder="articles"
        />
      </div>

      {/* SEO */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO</p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">SEO-titel (max 60 tecken)</label>
          <input name="seoTitle" maxLength={60} defaultValue={article?.seoTitle ?? ""} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Meta-beskrivning (max 155 tecken)</label>
          <textarea name="seoDescription" rows={2} maxLength={155} defaultValue={article?.seoDescription ?? ""} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Publicera */}
      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <input type="checkbox" id="published" name="published" value="true"
          defaultChecked={article?.published ?? true}
          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400" />
        <label htmlFor="published" className="text-sm font-medium text-purple-800 cursor-pointer">
          Publicera artikeln
        </label>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={isPending}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sparar...</> : isEdit ? "Spara ändringar" : "Skapa artikel"}
      </button>
    </form>
  );
}
