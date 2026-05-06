"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, X, Check } from "lucide-react";
import { createSlide, updateSlide, deleteSlide, toggleSlide } from "./actions";
import { ImageInput } from "@/components/ui/ImageInput";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Slide {
  id: string; title: string; subtitle: string | null; imageUrl: string | null;
  buttonText: string | null; buttonUrl: string | null; sortOrder: number; isActive: boolean;
}

const ic = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white";
const lc = "block text-sm font-medium text-gray-700 mb-1";

function SlideForm({ initial, onSave, onCancel }: {
  initial?: Slide;
  onSave: (fd: FormData, imageUrl: string | null) => Promise<void>;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await onSave(fd, imageUrl);
      onCancel();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={lc}>Rubrik *</label>
          <input name="title" required defaultValue={initial?.title} className={ic} placeholder="Välkommen till butiken" />
        </div>
        <div>
          <label className={lc}>Underrubrik</label>
          <input name="subtitle" defaultValue={initial?.subtitle ?? ""} className={ic} placeholder="Frön och tillbehör för svenska odlare" />
        </div>
      </div>

      <div>
        <label className={lc}>Bild</label>
        <ImageInput value={imageUrl} onChange={setImageUrl} bucket="uploads" folder="slides" />
        <p className="text-xs text-gray-400 mt-1">Rekommenderad storlek: 1440 × 600 px</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={lc}>Knapptext</label>
          <input name="buttonText" defaultValue={initial?.buttonText ?? ""} className={ic} placeholder="Handla nu" />
        </div>
        <div>
          <label className={lc}>Knapplänk</label>
          <input name="buttonUrl" defaultValue={initial?.buttonUrl ?? ""} className={ic} placeholder="/butik/kategori/fron" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label className={lc}>Sorteringsordning</label>
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} min={0} className={`${ic} w-24`} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-5">
          <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} className="h-4 w-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={pending}
          className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 disabled:opacity-60 transition-colors">
          {pending
            ? <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            : <Check className="h-4 w-4" />}
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
  const router = useRouter();

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

  async function handleCreate(fd: FormData, imageUrl: string | null) {
    if (imageUrl) fd.set("imageUrl", imageUrl); else fd.delete("imageUrl");
    await createSlide(fd);
    router.refresh();
    setShowCreate(false);
  }

  async function handleUpdate(id: string, fd: FormData, imageUrl: string | null) {
    if (imageUrl) fd.set("imageUrl", imageUrl); else fd.delete("imageUrl");
    await updateSlide(id, fd);
    router.refresh();
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      {slides.length > 0 && (
        <div className="space-y-3">
          {slides.map((slide) => (
            <Card key={slide.id} padding="none" className="overflow-hidden">
              {editing === slide.id ? (
                <div className="p-5">
                  <SlideForm
                    initial={slide}
                    onSave={(fd, img) => handleUpdate(slide.id, fd, img)}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                  <div className="relative h-16 w-28 rounded-lg overflow-hidden bg-sage-50 shrink-0">
                    {slide.imageUrl ? (
                      <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🖼️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">{slide.title}</p>
                      <Badge variant={slide.isActive ? "success" : "danger"} size="sm">
                        {slide.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <span className="text-xs text-gray-400">Ordning: {slide.sortOrder}</span>
                    </div>
                    {slide.subtitle && <p className="text-sm text-gray-500 truncate mt-0.5">{slide.subtitle}</p>}
                    {slide.buttonText && (
                      <p className="text-xs text-sage-600 mt-0.5">🔗 {slide.buttonText} → {slide.buttonUrl}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleToggle(slide.id, slide.isActive)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      title={slide.isActive ? "Avaktivera" : "Aktivera"}>
                      {slide.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditing(slide.id)}
                      className="p-2 text-gray-400 hover:text-sage-600 rounded-lg hover:bg-sage-50 transition-colors" title="Redigera">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(slide.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Ta bort">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showCreate ? (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ny slide</h2>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <SlideForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </Card>
      ) : (
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:text-green-700 hover:border-green-300 transition-colors w-full justify-center">
          <Plus className="h-4 w-4" /> Lägg till ny slide
        </button>
      )}

      {slides.length === 0 && !showCreate && (
        <p className="text-sm text-gray-400 text-center py-4">Inga slides ännu. Lägg till en för att aktivera hero-slidern.</p>
      )}
    </div>
  );
}
