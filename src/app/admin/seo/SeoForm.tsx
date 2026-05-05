"use client";

import { useRef, useState, useTransition } from "react";
import { upsertSeoSetting, deleteSeoSetting } from "./actions";
import { Badge } from "@/components/ui/Badge";
import { X, Plus, Pencil, Trash2, Check } from "lucide-react";

interface SeoSetting {
  id: string;
  pageType: string;
  pageId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  updatedAt: Date;
}

const PAGE_TYPE_OPTIONS = [
  "home",
  "vaxtdatabas",
  "vaxtdatabas/[slug]",
  "guider",
  "guider/[slug]",
  "kunskapsbank",
  "kunskapsbank/[slug]",
  "ordlista",
  "ordlista/[slug]",
  "forum",
  "fragor",
  "fragor/[slug]",
];

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

function SeoModal({
  initial,
  onClose,
}: {
  initial?: SeoSetting;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [noindex, setNoindex] = useState(initial?.noindex ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pageTypeMode, setPageTypeMode] = useState<"select" | "custom">("select");
  const [customPageType, setCustomPageType] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("noindex", noindex ? "true" : "false");
    setError(null);
    startTransition(async () => {
      try {
        await upsertSeoSetting(fd);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Fel uppstod");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? "Redigera SEO-inställning" : "Ny SEO-inställning"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {initial && <input type="hidden" name="id" value={initial.id} />}

          {/* Sidtyp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sidtyp <span className="text-red-500">*</span>
            </label>
            {initial ? (
              <>
                <input type="hidden" name="pageType" value={initial.pageType} />
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 font-mono">{initial.pageType}</p>
              </>
            ) : pageTypeMode === "select" ? (
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value === "__custom") {
                      setPageTypeMode("custom");
                    } else {
                      setCustomPageType(e.target.value);
                    }
                  }}
                >
                  <option value="" disabled>Välj sidtyp…</option>
                  {PAGE_TYPE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="__custom">Anpassad…</option>
                </select>
                <input type="hidden" name="pageType" value={customPageType} />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  name="pageType"
                  type="text"
                  autoFocus
                  placeholder="t.ex. blog/[slug]"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
                <button
                  type="button"
                  onClick={() => setPageTypeMode("select")}
                  className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                >
                  Välj från lista
                </button>
              </div>
            )}
          </div>

          {/* Meta-titel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta-titel</label>
            <input
              name="metaTitle"
              type="text"
              defaultValue={initial?.metaTitle ?? ""}
              maxLength={60}
              placeholder="T.ex. Växtdatabas – Minodling.se"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
            <p className="mt-1 text-xs text-gray-400">Max 60 tecken rekommenderas</p>
          </div>

          {/* Meta-beskrivning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta-beskrivning</label>
            <textarea
              name="metaDescription"
              rows={3}
              defaultValue={initial?.metaDescription ?? ""}
              maxLength={160}
              placeholder="Beskriv sidan för sökmotorer, max 160 tecken…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">Max 160 tecken rekommenderas</p>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
            <input
              name="canonicalUrl"
              type="url"
              defaultValue={initial?.canonicalUrl ?? ""}
              placeholder="https://www.minodling.se/…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* OG-bild */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OG-bild URL</label>
            <input
              name="ogImage"
              type="url"
              defaultValue={initial?.ogImage ?? ""}
              placeholder="https://…/og-image.jpg"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* Noindex */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNoindex((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                noindex ? "bg-red-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  noindex ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              Noindex {noindex && <span className="text-red-500 font-medium">(döljer sidan från sökmotorer)</span>}
            </span>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 disabled:opacity-60 transition-colors"
            >
              {pending ? (
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {initial ? "Spara ändringar" : "Skapa inställning"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SeoSettingsClient({ settings }: { settings: SeoSetting[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SeoSetting | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Ta bort SEO-inställning?")) return;
    setDeleting(id);
    startTransition(async () => {
      await deleteSeoSetting(id);
      setDeleting(null);
    });
  }

  return (
    <>
      {(showModal || editing) && (
        <SeoModal
          initial={editing ?? undefined}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO-inställningar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Per-sida SEO-överstyrningar. Globala inställningar hanteras under{" "}
            <a href="/admin/installningar" className="text-sage-600 hover:underline">Inställningar</a>.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ny inställning
        </button>
      </div>

      {settings.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm mb-3">Inga per-sida SEO-inställningar ännu</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white text-sm font-medium rounded-xl hover:bg-sage-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Lägg till första inställningen
          </button>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sidtyp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Meta-titel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Beskrivning</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Canonical</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Noindex</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Uppdaterad</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {settings.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium">{s.pageType}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                    <span className="line-clamp-1">{s.metaTitle ?? <span className="text-gray-300">–</span>}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs hidden md:table-cell">
                    <span className="line-clamp-1">{s.metaDescription ?? <span className="text-gray-300">–</span>}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {s.canonicalUrl ? (
                      <span className="text-green-600 text-xs">✓ Inställd</span>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.noindex ? (
                      <Badge variant="danger" size="sm">Ja</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Nej</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{formatDate(s.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditing(s)}
                        className="p-1.5 text-gray-400 hover:text-sage-600 rounded-lg hover:bg-sage-50 transition-colors"
                        title="Redigera"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                        title="Ta bort"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
