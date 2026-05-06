"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { slugify } from "@/lib/utils";
import { createCategory } from "@/app/admin/butik/actions";
import { ImageInput } from "@/components/ui/ImageInput";
import { Card } from "@/components/ui/Card";

export function CategoryCreateForm() {
  const [pending, startTransition] = useTransition();
  const [showSeo, setShowSeo] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (imageUrl) fd.set("imageUrl", imageUrl); else fd.delete("imageUrl");
    startTransition(async () => {
      await createCategory(fd);
      router.refresh();
      setImageUrl(null);
      setShowSeo(false);
      (e.target as HTMLFormElement).reset();
    });
  }

  const ic = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white";
  const lc = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Card padding="md">
      <h2 className="font-semibold text-gray-900 mb-4">Ny kategori</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={lc}>Namn *</label>
          <input name="name" required className={ic}
            onChange={(e) => {
              const form = e.currentTarget.form;
              const slugEl = form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slugEl) slugEl.value = slugify(e.target.value);
            }}
          />
        </div>
        <div>
          <label className={lc}>Slug *</label>
          <input name="slug" required className={ic} />
        </div>
        <div>
          <label className={lc}>Beskrivning</label>
          <textarea name="description" rows={3}
            placeholder="Beskriv kategorin…"
            className={`${ic} resize-none`} />
        </div>

        <div>
          <label className={lc}>Bild</label>
          <ImageInput
            value={imageUrl}
            onChange={setImageUrl}
            bucket="uploads"
            folder="kategorier"
          />
        </div>

        <div>
          <label className={lc}>Sorteringsordning</label>
          <input name="sortOrder" type="number" defaultValue={0} className={ic} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>

        <button type="button" onClick={() => setShowSeo((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors pt-1">
          {showSeo ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          SEO-inställningar
        </button>

        {showSeo && (
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <div>
              <label className={lc}>SEO-titel</label>
              <input name="seoTitle" placeholder="Lämna tomt för standardtitel" className={ic} />
            </div>
            <div>
              <label className={lc}>SEO-beskrivning</label>
              <textarea name="seoDescription" rows={2} placeholder="Max 160 tecken…" className={`${ic} resize-none`} />
            </div>
            <div>
              <label className={lc}>SEO-text (längst ner på sidan)</label>
              <textarea name="seoText" rows={4} placeholder="Längre text för sökmotorer…" className={`${ic} resize-none`} />
            </div>
          </div>
        )}

        <button type="submit" disabled={pending}
          className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors">
          {pending ? "Skapar…" : "Skapa kategori"}
        </button>
      </form>
    </Card>
  );
}
