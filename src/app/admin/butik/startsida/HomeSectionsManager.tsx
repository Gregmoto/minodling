"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { ImageInput } from "@/components/ui/ImageInput";
import {
  createHomeSection,
  updateHomeSection,
  deleteHomeSection,
  toggleHomeSection,
} from "./actions";

interface Section {
  id: string;
  sectionType: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  imageUrl2: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  buttonText2: string | null;
  buttonUrl2: string | null;
  title2: string | null;
  subtitle2: string | null;
  productCategoryId: string | null;
  plantId: string | null;
  sortOrder: number;
  isActive: boolean;
  category: { id: string; name: string; slug: string } | null;
  plant: { id: string; name: string; slug: string } | null;
}

interface Category { id: string; name: string; slug: string }
interface Plant { id: string; name: string; slug: string }

interface Props {
  sections: Section[];
  categories: Category[];
  plants: Plant[];
}

const SECTION_TYPES = [
  { value: "campaign_full", label: "Kampanjbanner (hel bredd)" },
  { value: "campaign_dual", label: "Dubbel kampanj (två kort)" },
  { value: "plant_feature", label: "Växtprodukter (karusell)" },
];

function SectionForm({
  initial,
  categories,
  plants,
  onSave,
  onCancel,
}: {
  initial?: Partial<Section>;
  categories: Category[];
  plants: Plant[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [imageUrl2, setImageUrl2] = useState(initial?.imageUrl2 ?? "");
  const [sectionType, setSectionType] = useState(initial?.sectionType ?? "campaign_full");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("imageUrl", imageUrl || "");
    fd.set("imageUrl2", imageUrl2 || "");
    try {
      await onSave(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sektionstyp *</label>
          <select
            name="sectionType"
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            {SECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sorteringsordning</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={initial?.sortOrder ?? 0}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Section 1 */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {sectionType === "campaign_dual" ? "Kort 1" : "Innehåll"}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Titel *</label>
            <input
              type="text"
              name="title"
              defaultValue={initial?.title ?? ""}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Undertitel</label>
            <input
              type="text"
              name="subtitle"
              defaultValue={initial?.subtitle ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        {sectionType === "campaign_full" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Brödtext</label>
            <textarea
              name="content"
              defaultValue={initial?.content ?? ""}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Knapptext</label>
            <input
              type="text"
              name="buttonText"
              defaultValue={initial?.buttonText ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Knapp-URL</label>
            <input
              type="text"
              name="buttonUrl"
              defaultValue={initial?.buttonUrl ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <ImageInput
          value={imageUrl}
          onChange={(v) => setImageUrl(v ?? "")}
          label="Bild"
          folder="shop/home"
        />
      </div>

      {/* Section 2 – only for dual */}
      {sectionType === "campaign_dual" && (
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kort 2</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Titel 2 *</label>
              <input
                type="text"
                name="title2"
                defaultValue={initial?.title2 ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Undertitel 2</label>
              <input
                type="text"
                name="subtitle2"
                defaultValue={initial?.subtitle2 ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Knapptext 2</label>
              <input
                type="text"
                name="buttonText2"
                defaultValue={initial?.buttonText2 ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Knapp-URL 2</label>
              <input
                type="text"
                name="buttonUrl2"
                defaultValue={initial?.buttonUrl2 ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <ImageInput
            value={imageUrl2}
            onChange={(v) => setImageUrl2(v ?? "")}
            label="Bild 2"
            folder="shop/home"
          />
        </div>
      )}

      {/* Plant feature extras */}
      {sectionType === "plant_feature" && (
        <div className="pt-2 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-1">Kopplad växt</label>
          <select
            name="plantId"
            defaultValue={initial?.plantId ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">– Välj växt –</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
          Avbryt
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60">
          {saving ? "Sparar…" : "Spara"}
        </button>
      </div>
    </form>
  );
}

export function HomeSectionsManager({ sections, categories, plants }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(fd: FormData) {
    const result = await createHomeSection(fd);
    if (result?.error) throw new Error(result.error);
    setShowForm(false);
  }

  async function handleUpdate(id: string, fd: FormData) {
    const result = await updateHomeSection(id, fd);
    if (result?.error) throw new Error(result.error);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Ta bort denna sektion?")) return;
    await deleteHomeSection(id);
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleHomeSection(id, !current);
  }

  const sectionTypeLabel = (type: string) =>
    SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className={`rounded-xl border p-4 ${section.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
          {editingId === section.id ? (
            <SectionForm
              initial={section}
              categories={categories}
              plants={plants}
              onSave={(fd) => handleUpdate(section.id, fd)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {sectionTypeLabel(section.sectionType)}
                  </span>
                  <span className="text-xs text-gray-400">Ordning: {section.sortOrder}</span>
                  {!section.isActive && (
                    <span className="text-xs text-gray-400 italic">Inaktiv</span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 mt-1 truncate">{section.title}</p>
                {section.subtitle && (
                  <p className="text-sm text-gray-500 truncate">{section.subtitle}</p>
                )}
                {section.plant && (
                  <p className="text-xs text-emerald-600 mt-0.5">Växt: {section.plant.name}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(section.id, section.isActive)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                  title={section.isActive ? "Inaktivera" : "Aktivera"}
                >
                  {section.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setEditingId(section.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                  title="Redigera"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                  title="Ta bort"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {sections.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-8">
          Inga sektioner ännu. Lägg till din första nedan.
        </p>
      )}

      {showForm ? (
        <SectionForm
          categories={categories}
          plants={plants}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lägg till sektion
        </button>
      )}
    </div>
  );
}
