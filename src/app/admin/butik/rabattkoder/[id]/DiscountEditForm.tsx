"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDiscount } from "@/app/admin/butik/actions";

interface Discount {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  excludeSaleProducts: boolean;
}

interface Props {
  discount: Discount;
}

function toDatetimeLocal(date: Date | null): string {
  if (!date) return "";
  // Format as YYYY-MM-DDTHH:mm
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function displayValue(discount: Discount): string {
  if (discount.discountType === "percent") return String(discount.discountValue);
  // fixed: stored in öre, display as SEK
  return (discount.discountValue / 100).toFixed(2);
}

export function DiscountEditForm({ discount }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateDiscount(discount.id, fd);
      router.push("/admin/butik/rabattkoder");
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Kod */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kod *</label>
          <input
            name="code"
            required
            defaultValue={discount.code}
            placeholder="SOMMAR25"
            className={`${inputClass} uppercase`}
          />
        </div>
        <div>
          <label className={labelClass}>Beskrivning</label>
          <input
            name="description"
            defaultValue={discount.description ?? ""}
            placeholder="T.ex. Sommarkampanj 2025"
            className={inputClass}
          />
        </div>
      </div>

      {/* Typ & värde */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Typ *</label>
          <select name="discountType" required defaultValue={discount.discountType} className={inputClass}>
            <option value="percent">Procent (%)</option>
            <option value="fixed">Fast belopp (SEK)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Värde *</label>
          <input
            name="discountValue"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={displayValue(discount)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Begränsningar */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Begränsningar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min. ordervärde (SEK)</label>
            <input
              name="minOrderAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={discount.minOrderAmount !== null ? (discount.minOrderAmount / 100).toFixed(2) : ""}
              placeholder="Inget minimum"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Max antal användningar</label>
            <input
              name="maxUses"
              type="number"
              min="0"
              defaultValue={discount.maxUses ?? ""}
              placeholder="Obegränsat"
              className={inputClass}
            />
            {discount.usedCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">Använd {discount.usedCount} gånger hittills</p>
            )}
          </div>
        </div>
      </div>

      {/* Giltighetstid */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Giltighetstid</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Giltig från</label>
            <input
              name="startsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(discount.startsAt)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Giltig till</label>
            <input
              name="endsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(discount.endsAt)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={discount.isActive}
            className="h-4 w-4 rounded text-green-600"
          />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="excludeSaleProducts"
            defaultChecked={discount.excludeSaleProducts}
            className="h-4 w-4 rounded text-green-600"
          />
          <span className="text-sm font-medium text-gray-700">Uteslut nedsatta produkter</span>
        </label>
      </div>

      {/* Knappar */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {pending ? "Sparar…" : "Spara ändringar"}
        </button>
        <a
          href="/admin/butik/rabattkoder"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Avbryt
        </a>
      </div>
    </form>
  );
}
