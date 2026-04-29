"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { createArticle, updateArticle } from "@/app/admin/actions";
import { uploadPlantImage } from "@/app/vaxtdatabas/actions";

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
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError,   setImageError]   = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    start]           = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function autoSlug(t: string) {
    return t.toLowerCase()
      .replace(/å/g,"a").replace(/ä/g,"a").replace(/ö/g,"o")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null); setImageLoading(true);
    const fd = new FormData(); fd.append("image", file);
    const r = await uploadPlantImage(fd);
    setImageLoading(false);
    if (r.error) setImageError(r.error);
    else if (r.url) setImageUrl(r.url);
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
        {imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="max-h-48 rounded-xl border border-gray-200 object-cover" />
            <button type="button" onClick={() => { setImageUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50">
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={imageLoading}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-sage-400 hover:text-sage-600 transition-colors disabled:opacity-50 w-full justify-center">
            {imageLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Laddar...</> : <><Upload className="h-4 w-4" /> Ladda upp bild</>}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        {imageError && <p className="text-xs text-red-600">{imageError}</p>}
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
          defaultChecked={article?.published ?? false}
          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400" />
        <label htmlFor="published" className="text-sm font-medium text-purple-800 cursor-pointer">
          Publicera artikeln
        </label>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={isPending || imageLoading}
        className="w-full py-3 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sparar...</> : isEdit ? "Spara ändringar" : "Skapa artikel"}
      </button>
    </form>
  );
}
