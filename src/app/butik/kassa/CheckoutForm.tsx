"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/shop/CartContext";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "../actions";

interface Profile {
  email?: string | null;
  fullName?: string | null;
}

export function CheckoutForm({ profile }: { profile: Profile }) {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = total >= 49900 ? 0 : 4900;
  const orderTotal = total + shipping;

  const nameParts = profile.fullName?.split(" ") ?? [];
  const defaultFirst = nameParts[0] ?? "";
  const defaultLast = nameParts.slice(1).join(" ") ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("cartItems", JSON.stringify(items));
    fd.set("shippingCost", String(shipping));

    try {
      const result = await createOrder(fd);
      if (result.success && result.orderId) {
        clearCart();
        router.push(`/butik/order/${result.orderId}`);
      } else {
        setError(result.error ?? "Något gick fel, försök igen.");
        setLoading(false);
      }
    } catch {
      setError("Något gick fel, försök igen.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Varukorgen är tom. <a href="/butik" className="text-green-700 underline">Gå till butiken</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulär */}
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-gray-900">Leveransuppgifter</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Förnamn</label>
            <input
              name="firstName"
              defaultValue={defaultFirst}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Efternamn</label>
            <input
              name="lastName"
              defaultValue={defaultLast}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
          <input
            name="email"
            type="email"
            defaultValue={profile.email ?? ""}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            name="phone"
            type="tel"
            className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adress</label>
          <input
            name="address"
            required
            className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postnummer</label>
            <input
              name="postalCode"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stad</label>
            <input
              name="city"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anteckningar (valfritt)</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {loading ? "Bearbetar..." : `Slutför beställning – ${formatPrice(orderTotal)}`}
        </button>
      </div>

      {/* Ordersammanfattning */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Din beställning</h2>
        <div className="bg-white rounded-2xl border border-sage-100 shadow-card p-5 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.name} <span className="text-gray-400">×{item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-sage-100 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delsumma</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Frakt</span>
              <span>{shipping === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1">
              <span>Totalt</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
