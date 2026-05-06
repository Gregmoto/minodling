"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDiscount } from "@/app/admin/butik/actions";
import { Card } from "@/components/ui/Card";

export function DiscountCreateForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createDiscount(fd);
      router.refresh();
      (e.target as HTMLFormElement).reset();
    });
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400";

  return (
    <Card padding="md">
      <h2 className="font-semibold text-gray-900 mb-4">Ny rabattkod</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kod *</label>
          <input name="code" required className={inputClass} placeholder="SOMMAR25" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ *</label>
          <select name="discountType" required className={inputClass}>
            <option value="percent">Procent (%)</option>
            <option value="fixed">Fast belopp (SEK)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Värde *</label>
          <input name="discountValue" type="number" min="0" step="0.01" required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min. ordervärde (SEK)</label>
          <input name="minOrderAmount" type="number" min="0" step="0.01" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max användningar</label>
          <input name="maxUses" type="number" min="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giltig till</label>
          <input name="endsAt" type="datetime-local" className={inputClass} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {pending ? "Skapar..." : "Skapa rabattkod"}
        </button>
      </form>
    </Card>
  );
}
