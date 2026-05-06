"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { slugify } from "@/lib/utils";
import { createCategory } from "@/app/admin/butik/actions";
import { Card } from "@/components/ui/Card";

export function CategoryCreateForm() {
  const [pending, startTransition] = useTransition();
  const [showSeo, setShowSeo] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createCategory(fd);
      router.refresh();
      (e.target as HTMLFormElement).reset();
      setShowSeo(false);
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Card padding="md">
      <h2 className="font-semibold text-gray-900 mb-4">Ny kategori</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Namn *</label>
          <input
            name="name"
            required
            className={inputClass}
            onChange={(e) => {
              const form = e.currentTarget.form;
              const slugEl = form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slugEl) slugEl.value = slugify(e.target.value);
            }}
          />
        </div>
        <div>
          <label className={labelClass}>Slug *</label>
          <input name="slug" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Beskrivning</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Beskriv kategorin – visas på kategorisidan…"
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className={labelClass}>Bild-URL</label>
          <input name="imageUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sorteringsordning</label>
          <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>

        {/* SEO toggle */}
        <button
          type="button"
          onClick={() => setShowSeo((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors pt-1"
        >
          {showSeo ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          SEO-inställningar
        </button>

        {showSeo && (
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <div>
              <label className={labelClass}>SEO-titel</label>
              <input name="seoTitle" placeholder="Lämna tomt för standardtitel" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SEO-beskrivning</label>
              <textarea
                name="seoDescription"
                rows={2}
                placeholder="Max 160 tecken…"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>SEO-text (längst ner på sidan)</label>
              <textarea
                name="seoText"
                rows={4}
                placeholder="Längre text för sökmotorer…"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {pending ? "Skapar…" : "Skapa kategori"}
        </button>
      </form>
    </Card>
  );
}
