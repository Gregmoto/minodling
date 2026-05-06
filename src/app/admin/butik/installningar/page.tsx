export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ShopSettingsForm } from "./ShopSettingsForm";

export const metadata: Metadata = { title: "Butiksinställningar | Admin" };

const ALL_KEYS = [
  "stripe_publishable_key",
  "stripe_secret_key",
  "stripe_webhook_secret",
  "resend_api_key",
  "resend_sender_email",
  "shop_contact_email",
  "trustpilot_bcc_email",
  "shop_shipping_cost",
  "shop_free_shipping_threshold",
  "shop_currency",
  "shop_vat_rate",
  "shop_name",
  "shop_enabled",
  "shop_order_confirmation_text",
  "shop_return_policy",
  "shop_shipping_info",
  "allow_reviews_all",
  "allow_reviews_verified_only",
];

const DEFAULTS: Record<string, string> = {
  shop_shipping_cost: "4900",
  shop_free_shipping_threshold: "49900",
  shop_currency: "SEK",
  shop_vat_rate: "25",
  shop_name: "Fröbutiken",
  shop_enabled: "true",
};

export default async function ShopInstallningarPage() {
  await requireAdmin();

  const rows = await prisma.shopSetting.findMany({
    where: { key: { in: ALL_KEYS } },
  }).catch(() => []);

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  const values = Object.fromEntries(
    ALL_KEYS.map((key) => [key, map[key] ?? DEFAULTS[key] ?? ""])
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Butiksinställningar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hantera betalning, frakt, e-post och butiksinfo.
        </p>
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs mt-3">
          Obs: Stripe- och Resend-nycklar sparas i databasen. Alternativt kan du lägga in dem i
          .env-filen som <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PUBLISHABLE_KEY</code>,{" "}
          <code>STRIPE_WEBHOOK_SECRET</code>.
        </p>
      </div>
      <ShopSettingsForm values={values} />
    </div>
  );
}
