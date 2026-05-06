"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  createHomeLink,
  updateHomeLink,
  deleteHomeLink,
  toggleHomeLink,
} from "./actions";

interface HomeLink {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  links: HomeLink[];
}

function LinkRow({
  link,
  onEdit,
  onDelete,
  onToggle,
}: {
  link: HomeLink;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${!link.isActive ? "opacity-50" : ""}`}>
      <td className="px-4 py-3 text-sm text-gray-500 w-12">{link.sortOrder}</td>
      <td className="px-4 py-3 text-sm">
        <span className="mr-1">{link.emoji}</span>
        <span className="font-medium text-gray-900">{link.title}</span>
      </td>
      <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-[200px]">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {link.url}
        </a>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          link.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          {link.isActive ? "Aktiv" : "Inaktiv"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={onToggle} title={link.isActive ? "Inaktivera" : "Aktivera"}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            {link.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button onClick={onEdit} title="Redigera"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={onDelete} title="Ta bort"
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function LinkForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<HomeLink>;
  onSave: (fd: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(new FormData(e.currentTarget));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Emoji</label>
          <input
            type="text"
            name="emoji"
            defaultValue={initial?.emoji ?? ""}
            placeholder="🌱"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Titel *</label>
          <input
            type="text"
            name="title"
            defaultValue={initial?.title ?? ""}
            required
            placeholder="Frön"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">URL *</label>
          <input
            type="text"
            name="url"
            defaultValue={initial?.url ?? ""}
            required
            placeholder="/butik/kategori/fron"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ordning</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={initial?.sortOrder ?? 0}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <div className="flex gap-2 justify-end mt-3">
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

export function HomeLinksManager({ links }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(fd: FormData) {
    const result = await createHomeLink(fd);
    if (result?.error) throw new Error(result.error);
    setShowForm(false);
  }

  async function handleUpdate(id: string, fd: FormData) {
    const result = await updateHomeLink(id, fd);
    if (result?.error) throw new Error(result.error);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Ta bort denna länk?")) return;
    await deleteHomeLink(id);
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleHomeLink(id, !current);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-600">Titel</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-600">URL</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) =>
              editingId === link.id ? (
                <tr key={link.id}>
                  <td colSpan={5} className="p-3">
                    <LinkForm
                      initial={link}
                      onSave={(fd) => handleUpdate(link.id, fd)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <LinkRow
                  key={link.id}
                  link={link}
                  onEdit={() => setEditingId(link.id)}
                  onDelete={() => handleDelete(link.id)}
                  onToggle={() => handleToggle(link.id, link.isActive)}
                />
              )
            )}
            {links.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                  Inga länkpiller ännu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <LinkForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lägg till länk
        </button>
      )}
    </div>
  );
}
