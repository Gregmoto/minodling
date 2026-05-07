"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { HEALTH_SYMPTOMS, HEALTH_PROBLEM_TYPES } from "@/lib/plant-health";
import { createRule, updateRule, deleteRule, toggleRule } from "./actions";

// ── Typer ─────────────────────────────────────────────────────────

interface Product { id: string; name: string; slug: string; }
interface Plant   { id: string; name: string; }
interface Rule {
  id:          string;
  productId:   string;
  product:     Product;
  plantId:     string | null;
  plant:       Plant | null;
  problemType: string | null;
  symptom:     string | null;
  priority:    number;
  isActive:    boolean;
}

interface Props {
  rules:    Rule[];
  products: Product[];
  plants:   Plant[];
}

// ── Rad-form ──────────────────────────────────────────────────────

function RuleForm({
  initial,
  products,
  plants,
  onSave,
  onCancel,
  saving,
}: {
  initial: Partial<Rule>;
  products: Product[];
  plants:   Plant[];
  onSave:   (data: Omit<Rule, "id" | "product" | "plant">) => void;
  onCancel: () => void;
  saving:   boolean;
}) {
  const [productId,   setProductId]   = useState(initial.productId   ?? "");
  const [plantId,     setPlantId]     = useState(initial.plantId     ?? "");
  const [problemType, setProblemType] = useState(initial.problemType ?? "");
  const [symptom,     setSymptom]     = useState(initial.symptom     ?? "");
  const [priority,    setPriority]    = useState(initial.priority    ?? 0);
  const [isActive,    setIsActive]    = useState(initial.isActive    ?? true);

  function submit() {
    if (!productId) return;
    onSave({
      productId,
      plantId:     plantId     || null,
      problemType: problemType || null,
      symptom:     symptom     || null,
      priority,
      isActive,
    });
  }

  const selectClass = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 bg-white";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
      {/* Produkt */}
      <div className="lg:col-span-2">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Produkt *</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className={selectClass}>
          <option value="">Välj produkt…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Växt */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Växt</label>
        <select value={plantId} onChange={(e) => setPlantId(e.target.value)} className={selectClass}>
          <option value="">Alla växter</option>
          {plants.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Problemtyp */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Problemtyp</label>
        <select value={problemType} onChange={(e) => setProblemType(e.target.value)} className={selectClass}>
          <option value="">Alla</option>
          {HEALTH_PROBLEM_TYPES.map((pt) => (
            <option key={pt.key} value={pt.key}>{pt.emoji} {pt.label}</option>
          ))}
        </select>
      </div>

      {/* Symptom */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Symptom</label>
        <select value={symptom} onChange={(e) => setSymptom(e.target.value)} className={selectClass}>
          <option value="">Alla</option>
          {HEALTH_SYMPTOMS.map((s) => (
            <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
          ))}
        </select>
      </div>

      {/* Prioritet + aktiv + knappar */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Prioritet</label>
          <input
            type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`h-[38px] px-3 rounded-xl text-xs font-semibold transition-colors ${
            isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isActive ? "Aktiv" : "Dold"}
        </button>
        <button
          onClick={submit}
          disabled={!productId || saving}
          className="h-[38px] px-3 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "…" : <Check className="h-4 w-4" />}
        </button>
        <button
          onClick={onCancel}
          className="h-[38px] px-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────

export function RecommendationManager({ rules, products, plants }: Props) {
  const [adding,    setAdding]    = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(data: Omit<Rule, "id" | "product" | "plant">) {
    setSaving(true);
    await createRule(data);
    setSaving(false);
    setAdding(false);
  }

  async function handleUpdate(id: string, data: Omit<Rule, "id" | "product" | "plant">) {
    setSaving(true);
    await updateRule(id, data);
    setSaving(false);
    setEditId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteRule(id);
    setDeletingId(null);
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleRule(id, !current);
  }

  // Hjälpfunktioner för labels
  function problemLabel(key: string | null) {
    if (!key) return <span className="text-gray-400 text-xs">Alla</span>;
    const pt = HEALTH_PROBLEM_TYPES.find((p) => p.key === key);
    return pt ? <span className="text-xs">{pt.emoji} {pt.label}</span> : <span className="text-xs">{key}</span>;
  }

  function symptomLabel(key: string | null) {
    if (!key) return <span className="text-gray-400 text-xs">Alla</span>;
    const s = HEALTH_SYMPTOMS.find((x) => x.key === key);
    return s ? <span className="text-xs">{s.emoji} {s.label}</span> : <span className="text-xs">{key}</span>;
  }

  return (
    <div className="space-y-4">

      {/* Lägg till */}
      {adding ? (
        <RuleForm
          initial={{}}
          products={products}
          plants={plants}
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ny regel
        </button>
      )}

      {/* Tabell */}
      {rules.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Inga regler ännu. Skapa din första regel ovan.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Produkt</th>
                <th className="px-4 py-3 text-left">Växt</th>
                <th className="px-4 py-3 text-left">Problemtyp</th>
                <th className="px-4 py-3 text-left">Symptom</th>
                <th className="px-4 py-3 text-center">Prioritet</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) =>
                editId === rule.id ? (
                  <tr key={rule.id}>
                    <td colSpan={7} className="p-2">
                      <RuleForm
                        initial={rule}
                        products={products}
                        plants={plants}
                        onSave={(data) => handleUpdate(rule.id, data)}
                        onCancel={() => setEditId(null)}
                        saving={saving}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={rule.id} className={`transition-colors ${rule.isActive ? "bg-white" : "bg-gray-50 opacity-60"}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{rule.product.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {rule.plant?.name ?? <span className="text-gray-400 text-xs">Alla</span>}
                    </td>
                    <td className="px-4 py-3">{problemLabel(rule.problemType)}</td>
                    <td className="px-4 py-3">{symptomLabel(rule.symptom)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{rule.priority}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(rule.id, rule.isActive)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          rule.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {rule.isActive
                          ? <><ToggleRight className="h-3.5 w-3.5" />Aktiv</>
                          : <><ToggleLeft  className="h-3.5 w-3.5" />Dold</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditId(rule.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          disabled={deletingId === rule.id}
                          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Hjälptext */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">Hur reglerna fungerar</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>En produkt visas om <strong>valfri</strong> matchning uppfylls: växt, problemtyp eller symptom.</li>
          <li>Lämna Växt/Problemtyp/Symptom tomt = matchar alltid (generell rekommendation).</li>
          <li>Högre prioritet = visas först.</li>
          <li>Inaktiva regler används inte i diagnoser eller identifieringar.</li>
        </ul>
      </div>
    </div>
  );
}
