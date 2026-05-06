"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/butik/actions";

const STATUS_OPTIONS = [
  { value: "pending", label: "Väntande" },
  { value: "processing", label: "Behandlas" },
  { value: "shipped", label: "Skickad" },
  { value: "completed", label: "Slutförd" },
  { value: "cancelled", label: "Avbruten" },
];

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const status = fd.get("status") as string;
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
      >
        {pending ? "Sparar..." : "Uppdatera"}
      </button>
    </form>
  );
}
