"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, GripVertical, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { createNavItem, updateNavItem, deleteNavItem, updateSortOrder } from "./actions";

interface NavItem {
  id:         string;
  label:      string;
  href:       string;
  sortOrder:  number;
  isActive:   boolean;
  categoryId: string | null;
  category:   { name: string; slug: string } | null;
}

interface Category {
  id:   string;
  name: string;
  slug: string;
}

interface Props {
  initialItems:  NavItem[];
  categories:    Category[];
}

export function ShopMenuManager({ initialItems, categories }: Props) {
  const [items, setItems]             = useState(initialItems);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [pending, startTransition]    = useTransition();
  const [dragIdx, setDragIdx]         = useState<number | null>(null);
  const router = useRouter();

  // ── Lägg till ──────────────────────────────────────────────────
  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createNavItem(fd);
      setShowAdd(false);
      router.refresh();
    });
  }

  // ── Redigera ───────────────────────────────────────────────────
  function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateNavItem(id, fd);
      setEditingId(null);
      router.refresh();
    });
  }

  // ── Radera ─────────────────────────────────────────────────────
  function handleDelete(id: string) {
    if (!confirm("Radera detta menyobjekt?")) return;
    startTransition(async () => {
      await deleteNavItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    });
  }

  // ── Drag-reorder ───────────────────────────────────────────────
  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setItems(next);
    setDragIdx(idx);
  }
  function handleDrop() {
    setDragIdx(null);
    const updated = items.map((item, i) => ({ id: item.id, sortOrder: i }));
    startTransition(() => updateSortOrder(updated));
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white";

  function CategorySelect({ defaultValue }: { defaultValue?: string | null }) {
    return (
      <select name="categoryId" defaultValue={defaultValue ?? ""} className={inputCls}>
        <option value="">— Ingen kategori (manuell länk) —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name} (/butik/kategori/{c.slug})</option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Lista ── */}
      {items.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
          Inga menyobjekt ännu. Lägg till det första nedan.
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={handleDrop}
            className={`rounded-2xl border bg-white transition-shadow ${
              dragIdx === idx ? "shadow-lg border-green-300" : "border-gray-200"
            }`}
          >
            {editingId === item.id ? (
              /* ── Redigeringsläge ── */
              <form onSubmit={(e) => handleUpdate(item.id, e)} className="p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Etikett</label>
                    <input name="label" required defaultValue={item.label} className={inputCls} placeholder="T.ex. Tomater" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Länk (href)</label>
                    <input name="href" required defaultValue={item.href} className={inputCls} placeholder="/butik/kategori/tomater" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Kopplad kategori (valfri)</label>
                    <CategorySelect defaultValue={item.categoryId} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Ordning</label>
                    <input name="sortOrder" type="number" defaultValue={item.sortOrder} className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select name="isActive" defaultValue={item.isActive ? "true" : "false"} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    <option value="true">✅ Aktiv i menyn</option>
                    <option value="false">❌ Dold (inaktiv)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={pending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors">
                    {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Spara
                  </button>
                  <button type="button" onClick={() => setEditingId(null)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                    <X className="h-3.5 w-3.5" /> Avbryt
                  </button>
                </div>
              </form>
            ) : (
              /* ── Visningsläge ── */
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="text-gray-300 cursor-grab active:cursor-grabbing shrink-0">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                    {!item.isActive && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">Inaktiv</span>
                    )}
                    {item.category && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">Kategori</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{item.href}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={item.href} target="_blank" rel="noopener"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => setEditingId(item.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} disabled={pending}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Lägg till-formulär ── */}
      {showAdd ? (
        <form onSubmit={handleAdd} className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50/30 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Nytt menyobjekt</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Etikett *</label>
              <input name="label" required autoFocus className={inputCls} placeholder="T.ex. Tomater" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Länk (href) *</label>
              <input name="href" required className={inputCls} placeholder="/butik/kategori/tomater" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Kopplad kategori (valfri)</label>
              <CategorySelect />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Ordning</label>
              <input name="sortOrder" type="number" defaultValue={items.length} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Lägg till
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all w-full justify-center">
          <Plus className="h-4 w-4" />
          Lägg till menyobjekt
        </button>
      )}
    </div>
  );
}
