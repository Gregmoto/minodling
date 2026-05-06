"use client";

import { useTransition, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Flower2, Plus, Loader2, Wand2, Check } from "lucide-react";
import { slugify } from "@/lib/utils";
import { createProduct, updateProduct, createQuickCategory } from "@/app/admin/butik/actions";
import { ImageInput } from "@/components/ui/ImageInput";

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
  function remove(plantId: string) { setLinks((prev) => prev.filter((l) => l.plantId !== plantId)); }
  function setRelation(plantId: string, relationType: string) {
    setLinks((prev) => prev.map((l) => l.plantId === plantId ? { ...l, relationType } : l));
  }
  const getPlant = (id: string) => plants.find((p) => p.id === id);

  return (
    <div>
      <input type="hidden" name="plantLinks" value={JSON.stringify(links)} />
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
                  {plant.latinName && <p className="text-xs text-gray-400 italic truncate">{plant.latinName}</p>}
                </div>
                <select value={link.relationType} onChange={(e) => setRelation(link.plantId, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-sage-400">
                  {RELATION_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <button type="button" onClick={() => remove(link.plantId)}
                  className="h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök växt att koppla…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
          autoComplete="off" />
        {filtered.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {filtered.map((plant) => (
              <button key={plant.id} type="button" onClick={() => add(plant)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-sage-50 transition-colors">
                <Flower2 className="h-4 w-4 text-sage-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{plant.name}</p>
                  {plant.latinName && <p className="text-xs text-gray-400 italic truncate">{plant.latinName}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {links.length === 0 && <p className="text-xs text-gray-400 mt-1.5">Inga växter kopplade ännu.</p>}
    </div>
  );
}

// ── QuickCategoryModal ────────────────────────────────────────────

function QuickCategoryModal({
  onCreated,
  onClose,
}: {
  onCreated: (cat: Category) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const result = await createQuickCategory(name);
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      onCreated(result);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Ny kategori</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategorinamn *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreate())}
            placeholder="t.ex. Tomater"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <p className="text-xs text-gray-400 mt-1">Slug skapas automatiskt från namnet.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {loading ? "Skapar…" : "Skapa kategori"}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProductForm ───────────────────────────────────────────────────

export function ProductForm({ categories: initialCategories, plants, existingLinks, product }: Props) {
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  // Kategori-state (kan utökas via QuickCategoryModal)
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(product?.categoryId ?? "");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Bild-state
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);

  // SEO auto-suggest
  const [seoTitle, setSeoTitle]       = useState(product?.seoTitle ?? "");
  const [seoDesc, setSeoDesc]         = useState(product?.seoDescription ?? "");
  const [seoSuggested, setSeoSuggested] = useState(false);

  const nameRef     = useRef<HTMLInputElement>(null);
  const descRef     = useRef<HTMLTextAreaElement>(null);
  const shortDescRef = useRef<HTMLInputElement>(null);

  function autoSuggestSeo() {
    const name  = nameRef.current?.value?.trim() ?? "";
    const short = shortDescRef.current?.value?.trim() ?? "";
    const desc  = descRef.current?.value?.trim() ?? "";
    if (!name) return;
    const title = `${name} | Minodling Butik`;
    const summary = short || desc.slice(0, 140);
    setSeoTitle(title.slice(0, 70));
    setSeoDesc(summary.slice(0, 160));
    setSeoSuggested(true);
    setTimeout(() => setSeoSuggested(false), 2000);
  }

  function handleCategoryCreated(cat: Category) {
    setCategories((prev) => [...prev, cat]);
    setSelectedCategory(cat.id);
    setShowCategoryModal(false);
  }

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const fd = new FormData(e.currentTarget);
    // Inject controlled values
    fd.set("categoryId", selectedCategory);
    if (imageUrl) fd.set("imageUrl", imageUrl); else fd.delete("imageUrl");
    fd.set("seoTitle", seoTitle);
    fd.set("seoDescription", seoDesc);
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, fd);
        } else {
          await createProduct(fd);
        }
        router.push("/admin/butik/produkter");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Okänt fel – försök igen.";
        // Show slug conflict hint
        const display = msg.includes("Unique constraint") || msg.includes("unique")
          ? "En produkt med samma slug finns redan. Ändra slugen och försök igen."
          : msg.length < 200
            ? msg
            : "Något gick fel. Kontrollera att alla fält är korrekt ifyllda.";
        setSubmitError(display);
      }
    });
  }, [product, router, selectedCategory, imageUrl, seoTitle, seoDesc]);

  const ic = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent bg-white";
  const lc = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <>
      {showCategoryModal && (
        <QuickCategoryModal
          onCreated={handleCategoryCreated}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Bas ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lc}>Namn *</label>
            <input
              ref={nameRef}
              name="name"
              required
              defaultValue={product?.name}
              className={ic}
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
          <input ref={shortDescRef} name="shortDescription" defaultValue={product?.shortDescription ?? ""} className={ic} />
        </div>

        <div>
          <label className={lc}>Beskrivning</label>
          <textarea ref={descRef} name="description" defaultValue={product?.description ?? ""} rows={5} className={`${ic} resize-y`} />
        </div>

        {/* ── Priser & lager ── */}
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

        {/* ── Kategori + SKU ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lc}>Kategori</label>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`${ic} flex-1`}
              >
                <option value="">Ingen kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                title="Skapa ny kategori"
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className={lc}>SKU</label>
            <input name="sku" defaultValue={product?.sku ?? ""} className={ic} />
          </div>
        </div>

        {/* ── Svårighet & odlingstyp ── */}
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

        {/* ── Bild ── */}
        <div>
          <label className={lc}>Produktbild</label>
          <ImageInput
            value={imageUrl}
            onChange={setImageUrl}
            bucket="uploads"
            folder="produkter"
            label="Dra och släpp produktbild"
          />
        </div>

        {/* ── Växt-koppling ── */}
        <div className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/30">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Flower2 className="h-4 w-4 text-emerald-500" />
            Koppla till växter
          </label>
          <PlantPicker plants={plants} initial={existingLinks} />
        </div>

        {/* ── SEO ── */}
        <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">SEO</label>
            <button
              type="button"
              onClick={autoSuggestSeo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                seoSuggested
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {seoSuggested
                ? <><Check className="h-3.5 w-3.5" /> Klart!</>
                : <><Wand2 className="h-3.5 w-3.5" /> Föreslå automatiskt</>}
            </button>
          </div>
          <div>
            <label className={lc}>
              SEO-titel
              <span className={`ml-1 text-xs ${seoTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>
                ({seoTitle.length}/70)
              </span>
            </label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Produktnamn | Minodling Butik"
              className={ic}
            />
          </div>
          <div>
            <label className={lc}>
              SEO-beskrivning
              <span className={`ml-1 text-xs ${seoDesc.length > 150 ? "text-amber-500" : "text-gray-400"}`}>
                ({seoDesc.length}/160)
              </span>
            </label>
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              rows={2}
              placeholder="Kort beskrivning som visas i sökresultat…"
              className={`${ic} resize-none`}
            />
          </div>
        </div>

        {/* ── Aktiv / Utvald ── */}
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

        {submitError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠️ {submitError}
          </div>
        )}

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
    </>
  );
}
