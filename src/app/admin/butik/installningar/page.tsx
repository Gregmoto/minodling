export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ShopSettingsForm } from "./ShopSettingsForm";

export const metadata: Metadata = { title: "Butiksinställningar | Admin" };

const SHOP_SETTING_KEYS = [
  { key: "shop_name", label: "Butiksnamn", defaultValue: "Fröbutiken" },
  { key: "shop_enabled", label: "Butik aktiv (true/false)", defaultValue: "true" },
  { key: "shop_shipping_cost", label: "Frakt (öre, standard 4900 = 49 kr)", defaultValue: "4900" },
  { key: "shop_free_shipping_threshold", label: "Fri frakt över (öre, standard 49900 = 499 kr)", defaultValue: "49900" },
  { key: "shop_currency", label: "Valuta", defaultValue: "SEK" },
];

export default async function ShopInstallningarPage() {
  await requireAdmin();

  const rows = await prisma.shopSetting.findMany({
    where: { key: { in: SHOP_SETTING_KEYS.map((s) => s.key) } },
  }).catch(() => []);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  const settings = SHOP_SETTING_KEYS.map((s) => ({
    ...s,
    value: map[s.key] ?? s.defaultValue,
  }));

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Butiksinställningar</h1>
        <p className="text-gray-500 text-sm mt-1">Generella inställningar för butiken</p>
      </div>
      <Card padding="md">
        <ShopSettingsForm settings={settings} />
      </Card>
    </div>
  );
}
