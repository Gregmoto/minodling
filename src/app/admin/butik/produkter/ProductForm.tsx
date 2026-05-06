"use client";

import { useTransition, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Flower2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { createProduct, updateProduct } from "@/app/admin/butik/actions";

interface Category { id: string; name: string; }
interface Plant { id: string; name: string; slug: string; latinName: string | null; imageUrl: string | null; }
interface PlantLink { plantId: string; relationType: string; }

interface Product {
  id: string; name: string; slug: string; description: string | null;
  shortDescription: string | null; imageUrl: string | null; categoryId: string | null;
  price: number; compareAtPrice: number | null; sku: string | null;
  stockQuantity: number; isActive: boolean; isFeatured: boolean;
  seoTitle: string | null; seoDescription: string | null;
  difficultyLevel: string | null; growingType: string | null;
}

interface Props {
  categories: Category[];
  plants: Plant[];
  existingLinks: PlantLink[];
  product?: Product;
}

const RELATION_TYPES = [
  { value: "related",     label: "Passar till" },
  { value: "recommended", label: "Rekommenderas för" },
  { value: "companion",   label: "Bra sällskapsväxt för" },
];

// ── PlantPicker ───────────────────────────────────────────────────

function PlantPicker({ plants, initial }: { plants: Plant[]; initial: PlantLink[] }) {
  const [links, setLinks] = useState<PlantLink[]>(initial);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIds = new Set(links.map((l) => l.plantId));
  const filtered = query.length >= 1
    ? plants.filter((p) =>
        !selectedIds.has(p.id) &&
        (p.name.toLowerCase().includes(query.toLowerCase()) ||
         (p.latinName ?? "").toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  function add(plant: Plant) {
    setLinks((prev) => [...prev, { plantId: plant.id, relationType: "related" }]);
    setQuery("");
    inputRef.current?.focus();
  }

  function remove(plantId: string) {
    setLinks((prev) => prev.filter((l) => l.plantId !== plantId));
  }

  function setRelation(plantId: string, relationType: string) {
    setLinks((prev) => prev.map((l) => l.plantId === plantId ? { ...l, relationType } : l));
  }

  const getPlant = (id: string) => plants.find((p) => p.id === id);

  return (
    <div>
      <input type="hidden" name="plantLinks" value={JSON.stringify(links)} />

      {/* Valda växter */}
      {links.length > 0 && (
        <div className="mb-3 space-y-2">
          {links.map((link) => {
            const plant = getPlant(link.plantId);
            if (!plant) return null;
            return (
              <div key={link.plantId} className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Flower2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{plant.name}</p>
                  {plant.latinName && (
                    <p className="text-xs text-gray-400 italic truncate">{plant.latinName}</p>
                  )}
                </div>
                <select
                  value={link.relationType}
                  onChange={(e) => setRelation(link.plantId, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-sage-400"
                >
                  {RELATION_TYPES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(link.plantId)}
                  className="h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sökfält */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök växt att koppla…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
          autoComplete="off"
        />
        {filtered.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {filtered.map((plant) => (
              <button
                key={plant.id}
                type="button"
                onClick={() => add(plant)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-sage-50 transition-colors"
              >
                <Flower2 className="h-4 w-4 text-sage-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{plant.name}</p>
                  {plant.latinName && (
                    <p className="text-xs text-gray-400 italic truncate">{plant.latinName}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {links.length === 0 && (
        <p className="text-xs text-gray-400 mt-1.5">Inga växter kopplade ännu.</p>
      )}
    </div>
  );
}

// ── ProductForm ───────────────────────────────────────────────────

export function ProductForm({ categories, plants, existingLinks, product }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (product) {
        await updateProduct(product.id, fd);
      } else {
        await createProduct(fd);
      }
      router.push("/admin/butik/produkter");
    });
  }

  const ic = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent bg-white";
  const lc = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lc}>Namn *</label>
          <input name="name" required defaultValue={product?.name} className={ic}
            onChange={(e) => {
              const slugEl = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slugEl && !product) slugEl.value = slugify(e.target.value);
            }}
          />
        </div>
        <div>
          <label className={lc}>Slug *</label>
          <input name="slug" required defaultValue={product?.slug} className={ic} />
        </div>
      </div>

      <div>
        <label className={lc}>Kort beskrivning</label>
        <input name="shortDescription" defaultValue={product?.shortDescription ?? ""} className={ic} />
      </div>

      <div>
        <label className={lc}>Beskrivning</label>
        <textarea name="description" defaultValue={product?.description ?? ""} rows={5} className={`${ic} resize-y`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={lc}>Pris (SEK) *</label>
          <input name="price" type="number" step="0.01" min="0" required
            defaultValue={product ? (product.price / 100).toFixed(2) : ""} className={ic} />
        </div>
        <div>
          <label className={lc}>Jämförpris (SEK)</label>
          <input name="compareAtPrice" type="number" step="0.01" min="0"
            defaultValue={product?.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""} className={ic} />
        </div>
        <div>
          <label className={lc}>Lager *</label>
          <input name="stockQuantity" type="number" min="0" required defaultValue={product?.stockQuantity ?? 0} className={ic} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lc}>Kategori</label>
          <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={ic}>
            <option value="">Ingen kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lc}>SKU</label>
          <input name="sku" defaultValue={product?.sku ?? ""} className={ic} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lc}>Svårighetsgrad</label>
          <select name="difficultyLevel" defaultValue={product?.difficultyLevel ?? ""} className={ic}>
            <option value="">– Välj –</option>
            <option value="easy">🌱 Nybörjarvänlig</option>
            <option value="medium">🌿 Medel</option>
            <option value="hard">🌳 Avancerad</option>
          </select>
        </div>
        <div>
          <label className={lc}>Odlingstyp</label>
          <select name="growingType" defaultValue={product?.growingType ?? ""} className={ic}>
            <option value="">– Välj –</option>
            <option value="balkong">🏠 Balkong</option>
            <option value="växthus">🏡 Växthus</option>
            <option value="trädgård">🌳 Trädgård</option>
            <option value="inomhus">🪴 Inomhus</option>
            <option value="kolonilott">🌱 Kolonilott</option>
          </select>
        </div>
      </div>

      <div>
        <label className={lc}>Bild-URL</label>
        <input name="imageUrl" type="url" defaultValue={product?.imageUrl ?? ""} className={ic} />
      </div>

      {/* Växt-koppling */}
      <div className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/30">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <Flower2 className="h-4 w-4 text-emerald-500" />
          Koppla till växter
        </label>
        <PlantPicker plants={plants} initial={existingLinks} />
      </div>

      {/* SEO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lc}>SEO-titel</label>
          <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className={ic} />
        </div>
        <div>
          <label className={lc}>SEO-beskrivning</label>
          <input name="seoDescription" defaultValue={product?.seoDescription ?? ""} className={ic} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="h-4 w-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="h-4 w-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">Utvald produkt</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending}
          className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors">
          {pending ? "Sparar…" : product ? "Spara ändringar" : "Skapa produkt"}
        </button>
        <a href="/admin/butik/produkter" className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Avbryt
        </a>
      </div>
    </form>
  );
}
