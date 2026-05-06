"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveShopSettings } from "@/app/admin/butik/actions";

interface Setting {
  key: string;
  label: string;
  value: string;
  defaultValue: string;
}

export function ShopSettingsForm({ settings }: { settings: Setting[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveShopSettings(fd);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {settings.map((s) => (
        <div key={s.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
          <input
            name={s.key}
            defaultValue={s.value}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
      >
        {pending ? "Sparar..." : "Spara inställningar"}
      </button>
    </form>
  );
}
