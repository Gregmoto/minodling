"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { updateCategory } from "@/app/admin/butik/actions";
import { ImageInput } from "@/components/ui/ImageInput";

interface Category {
  id: string; name: string; slug: string; description: string | null;
  imageUrl: string | null; seoTitle: string | null; seoDescription: string | null;
  seoText: string | null; sortOrder: number; isActive: boolean;
}

export function CategoryEditForm({ category }: { category: Category }) {
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(category.imageUrl ?? null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (imageUrl) fd.set("imageUrl", imageUrl); else fd.delete("imageUrl");
    startTransition(async () => {
      await updateCategory(category.id, fd);
      router.push("/admin/butik/kategorier");
    });
  }

  const ic = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white";
  const lc = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lc}>Namn *</label>
          <input name="name" required defaultValue={category.name} className={ic}
            onChange={(e) => {
              const form = e.currentTarget.form;
              const slugEl = form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slugEl && !slugEl.dataset.touched) slugEl.value = slugify(e.target.value);
            }}
          />
        </div>
        <div>
          <label className={lc}>Slug *</label>
          <input name="slug" required defaultValue={category.slug} className={ic}
            onChange={(e) => { e.currentTarget.dataset.touched = "1"; }} />
        </div>
      </div>

      <div>
        <label className={lc}>Beskrivning</label>
        <textarea name="description" rows={4} defaultValue={category.description ?? ""}
          placeholder="Beskriv kategorin…" className={`${ic} resize-none`} />
      </div>

      <div>
        <label className={lc}>Bild</label>
        <ImageInput value={imageUrl} onChange={setImageUrl} bucket="uploads" folder="kategorier" />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <label className={lc}>SEO-titel</label>
            <input name="seoTitle" defaultValue={category.seoTitle ?? ""}
              placeholder={`${category.name} – Minodling Butik`} className={ic} />
            <p className="text-xs text-gray-400 mt-1">Lämna tomt för att använda standardtitel</p>
          </div>
          <div>
            <label className={lc}>SEO-beskrivning</label>
            <textarea name="seoDescription" rows={2} defaultValue={category.seoDescription ?? ""}
              placeholder="Max 160 tecken…" className={`${ic} resize-none`} />
          </div>
          <div>
            <label className={lc}>SEO-text (visas längst ner på kategorisidan)</label>
            <textarea name="seoText" rows={6} defaultValue={category.seoText ?? ""}
              placeholder="Längre text för sökmotorer…" className={`${ic} resize-none`} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Inställningar</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Sorteringsordning</label>
            <input name="sortOrder" type="number" defaultValue={category.sortOrder} className={ic} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="h-4 w-4 rounded text-green-600" />
              <span className="text-sm font-medium text-gray-700">Aktiv</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending}
          className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors">
          {pending ? "Sparar…" : "Spara ändringar"}
        </button>
        <a href="/admin/butik/kategorier"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Avbryt
        </a>
      </div>
    </form>
  );
}
