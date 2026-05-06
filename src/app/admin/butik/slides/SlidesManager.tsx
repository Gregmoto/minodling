"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, X, Check } from "lucide-react";
import { createSlide, updateSlide, deleteSlide, toggleSlide } from "./actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";

function SlideForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Slide;
  onSave: (fd: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await onSave(fd);
      onCancel();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rubrik *</label>
          <input name="title" required defaultValue={initial?.title} className={inputClass} placeholder="Välkommen till butiken" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Underrubrik</label>
          <input name="subtitle" defaultValue={initial?.subtitle ?? ""} className={inputClass} placeholder="Frön och tillbehör för svenska odlare" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bild-URL</label>
        <input name="imageUrl" type="url" defaultValue={initial?.imageUrl ?? ""} className={inputClass} placeholder="https://…/slide.jpg" />
        <p className="text-xs text-gray-400 mt-1">Rekommenderad storlek: 1440 × 600 px</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Knapptext</label>
          <input name="buttonText" defaultValue={initial?.buttonText ?? ""} className={inputClass} placeholder="Handla nu" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Knapplänk</label>
          <input name="buttonUrl" defaultValue={initial?.buttonUrl ?? ""} className={inputClass} placeholder="/butik/kategori/fron" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sorteringsordning</label>
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} min={0} className={`${inputClass} w-24`} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-5">
          <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} className="h-4 w-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 disabled:opacity-60 transition-colors"
        >
          {pending ? <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> : <Check className="h-4 w-4" />}
          {initial ? "Spara ändringar" : "Skapa slide"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Avbryt
        </button>
      </div>
    </form>
  );
}

export function SlidesManager({ slides: initialSlides }: { slides: Slide[] }) {
  const [slides, setSlides] = useState(initialSlides);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Ta bort slide?")) return;
    startTransition(async () => {
      await deleteSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleSlide(id, !current);
      setSlides((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !current } : s));
    });
  }

  return (
    <div className="space-y-6">
      {/* Lista */}
      {slides.length > 0 && (
        <div className="space-y-3">
          {slides.map((slide) => (
            <Card key={slide.id} padding="none" className="overflow-hidden">
              {editing === slide.id ? (
                <div className="p-5">
                  <SlideForm
                    initial={slide}
                    onSave={(fd) => updateSlide(slide.id, fd)}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  {/* Drag-handle (visuell only) */}
                  <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />

                  {/* Miniatyr */}
                  <div className="relative h-16 w-28 rounded-lg overflow-hidden bg-sage-50 shrink-0">
                    {slide.imageUrl ? (
                      <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">{slide.title}</p>
                      <Badge variant={slide.isActive ? "success" : "danger"} size="sm">
                        {slide.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <span className="text-xs text-gray-400">Ordning: {slide.sortOrder}</span>
                    </div>
                    {slide.subtitle && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">{slide.subtitle}</p>
                    )}
                    {slide.buttonText && (
                      <p className="text-xs text-sage-600 mt-0.5">
                        🔗 {slide.buttonText} → {slide.buttonUrl}
                      </p>
                    )}
                  </div>

                  {/* Åtgärder */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(slide.id, slide.isActive)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      title={slide.isActive ? "Avaktivera" : "Aktivera"}
                    >
                      {slide.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditing(slide.id)}
                      className="p-2 text-gray-400 hover:text-sage-600 rounded-lg hover:bg-sage-50 transition-colors"
                      title="Redigera"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Ta bort"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Skapa ny */}
      {showCreate ? (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ny slide</h2>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <SlideForm
            onSave={createSlide}
            onCancel={() => setShowCreate(false)}
          />
        </Card>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:text-green-700 hover:border-green-300 transition-colors w-full justify-center"
        >
          <Plus className="h-4 w-4" />
          Lägg till ny slide
        </button>
      )}

      {slides.length === 0 && !showCreate && (
        <p className="text-sm text-gray-400 text-center py-4">Inga slides ännu. Lägg till en för att aktivera hero-slidern.</p>
      )}
    </div>
  );
}
