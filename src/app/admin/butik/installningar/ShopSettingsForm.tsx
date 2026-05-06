"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveShopSettings } from "@/app/admin/butik/actions";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

function Field({
  name,
  label,
  type = "text",
  currentValue,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  currentValue: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={currentValue || defaultValue || ""}
        className={inputClass}
      />
    </div>
  );
}

/** Secret field: shows placeholder dots when a saved value exists. */
function SecretField({
  name,
  label,
  currentValue,
}: {
  name: string;
  label: string;
  currentValue: string;
}) {
  const hasSaved = currentValue.trim().length > 0;
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        name={name}
        type="password"
        defaultValue=""
        placeholder={hasSaved ? "••••••••  (lämna tomt för att behålla)" : "Ange värde"}
        className={inputClass}
      />
      {/* Keep old value if user leaves field blank — handled server-side */}
    </div>
  );
}

function TextareaField({
  name,
  label,
  currentValue,
}: {
  name: string;
  label: string;
  currentValue: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea
        name={name}
        rows={4}
        defaultValue={currentValue}
        className={inputClass + " resize-y"}
      />
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card padding="md">
      <h2 className="text-base font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

export function ShopSettingsForm({ values }: { values: Record<string, string> }) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Betalning */}
      <SectionCard title="Betalning (Stripe)">
        <Field
          name="stripe_publishable_key"
          label="Stripe publik nyckel (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)"
          currentValue={values.stripe_publishable_key}
        />
        <SecretField
          name="stripe_secret_key"
          label="Stripe hemlig nyckel (STRIPE_SECRET_KEY)"
          currentValue={values.stripe_secret_key}
        />
        <SecretField
          name="stripe_webhook_secret"
          label="Stripe webhook-hemlighet (STRIPE_WEBHOOK_SECRET)"
          currentValue={values.stripe_webhook_secret}
        />
      </SectionCard>

      {/* E-post */}
      <SectionCard title="E-post (Resend)">
        <SecretField
          name="resend_api_key"
          label="Resend API-nyckel"
          currentValue={values.resend_api_key}
        />
        <Field
          name="resend_sender_email"
          label="Avsändar-e-post (t.ex. butik@minodling.se)"
          type="email"
          currentValue={values.resend_sender_email}
        />
        <Field
          name="shop_contact_email"
          label="Butikens kontakt-e-post (admin-notiser skickas hit)"
          type="email"
          currentValue={values.shop_contact_email}
        />
        <div>
          <Field
            name="trustpilot_bcc_email"
            label="Trustpilot BCC-e-post (BCC på orderbekräftelse)"
            type="email"
            currentValue={values.trustpilot_bcc_email}
          />
          <p className="text-xs text-gray-400 mt-1">
            Din unika Trustpilot-adress, t.ex.{" "}
            <code className="bg-gray-100 px-1 rounded">minodling.se+dc0dc4c6cd@invite.trustpilot.com</code>
          </p>
        </div>
      </SectionCard>

      {/* Frakt & priser */}
      <SectionCard title="Frakt & priser">
        <Field
          name="shop_shipping_cost"
          label="Fraktkostnad (öre, 4900 = 49 kr)"
          currentValue={values.shop_shipping_cost}
          defaultValue="4900"
        />
        <Field
          name="shop_free_shipping_threshold"
          label="Fri frakt över (öre, 49900 = 499 kr)"
          currentValue={values.shop_free_shipping_threshold}
          defaultValue="49900"
        />
        <Field
          name="shop_currency"
          label="Valuta"
          currentValue={values.shop_currency}
          defaultValue="SEK"
        />
        <Field
          name="shop_vat_rate"
          label="Momssats (%, t.ex. 25)"
          currentValue={values.shop_vat_rate}
          defaultValue="25"
        />
      </SectionCard>

      {/* Butiksinfo */}
      <SectionCard title="Butiksinfo">
        <Field
          name="shop_name"
          label="Butiksnamn"
          currentValue={values.shop_name}
          defaultValue="Fröbutiken"
        />
        <Field
          name="shop_enabled"
          label="Butik aktiv (true/false)"
          currentValue={values.shop_enabled}
          defaultValue="true"
        />
      </SectionCard>

      {/* Omdömen */}
      <SectionCard title="Omdömen">
        <Field
          name="allow_reviews_all"
          label="Tillåt omdömen från alla (true/false)"
          currentValue={values.allow_reviews_all}
          defaultValue="true"
        />
        <Field
          name="allow_reviews_verified_only"
          label="Kräv verifierat köp för omdömen (true/false)"
          currentValue={values.allow_reviews_verified_only}
          defaultValue="false"
        />
        <p className="text-xs text-gray-400">
          Om båda är false stängs omdömessystemet av. Om{" "}
          <code className="bg-gray-100 px-1 rounded">allow_reviews_verified_only</code> är true krävs
          verifierat köp.
        </p>
      </SectionCard>

      {/* Texter */}
      <SectionCard title="Texter">
        <TextareaField
          name="shop_order_confirmation_text"
          label="Orderbekräftelse-text (visas i e-post)"
          currentValue={values.shop_order_confirmation_text}
        />
        <TextareaField
          name="shop_return_policy"
          label="Returpolicy-text"
          currentValue={values.shop_return_policy}
        />
        <TextareaField
          name="shop_shipping_info"
          label="Leveransinformation"
          currentValue={values.shop_shipping_info}
        />
      </SectionCard>

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
