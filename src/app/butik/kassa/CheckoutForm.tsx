"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Package, Lock, Truck, RotateCcw, Tag, X } from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { formatPrice } from "@/lib/utils";
import { createCheckoutSession } from "../actions";

interface Profile {
  email?: string | null;
  fullName?: string | null;
}

export function CheckoutForm({ profile }: { profile: Profile }) {
  const { items, total, clearCart } = useCart();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameAddress, setSameAddress] = useState(true);

  // Förifyll rabatt från varukorgssidan
  const [discountCode]   = useState(searchParams.get("discount") ?? "");
  const [discountAmount] = useState(parseInt(searchParams.get("discountAmount") ?? "0") || 0);

  const shipping    = total >= 49900 ? 0 : 4900;
  const orderTotal  = Math.max(0, total + shipping - discountAmount);

  useEffect(() => {
    // Om Stripe lyckades (redirect tillbaka hit via cancel), rensa ingenting
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    fd.set("cartItems", JSON.stringify(items));
    fd.set("discountCode",   discountCode);
    fd.set("discountAmount", String(discountAmount));

    try {
      const result = await createCheckoutSession(fd);
      if (result.success) {
        if (result.sessionUrl) {
          // Stripe checkout – rensa cart och redirect
          clearCart();
          window.location.href = result.sessionUrl;
        } else if (result.orderId) {
          // Utan Stripe (test-läge) – direkt till bekräftelse
          clearCart();
          window.location.href = `/butik/kassa/bekraftelse?order_id=${result.orderId}`;
        }
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
        Varukorgen är tom.{" "}
        <a href="/butik" className="text-green-700 underline">Gå till butiken</a>
      </div>
    );
  }

  const ic = "w-full px-3 py-2.5 rounded-xl border border-sage-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500";
  const lc = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">

      {/* ── FORMULÄR ──────────────────────────────── */}
      <div className="lg:col-span-3 space-y-6">

        {/* Kontakt */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Kontaktuppgifter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={lc}>Fullständigt namn *</label>
              <input name="fullName" required defaultValue={profile.fullName ?? ""} className={ic} />
            </div>
            <div>
              <label className={lc}>E-postadress *</label>
              <input name="email" type="email" required defaultValue={profile.email ?? ""} className={ic} />
            </div>
            <div>
              <label className={lc}>Telefon</label>
              <input name="phone" type="tel" className={ic} placeholder="070-000 00 00" />
            </div>
          </div>
        </section>

        {/* Leveransadress */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Leveransadress
          </h2>
          <div className="space-y-4">
            <div>
              <label className={lc}>Gatuadress *</label>
              <input name="address" required className={ic} placeholder="Storgatan 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lc}>Postnummer *</label>
                <input name="postalCode" required className={ic} placeholder="12345" />
              </div>
              <div>
                <label className={lc}>Stad *</label>
                <input name="city" required className={ic} placeholder="Stockholm" />
              </div>
            </div>
            <input type="hidden" name="country" value="SE" />
          </div>
        </section>

        {/* Fakturaadress */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Fakturaadress
          </h2>
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={sameAddress}
              onChange={(e) => setSameAddress(e.target.checked)}
              className="h-4 w-4 rounded text-green-600"
            />
            <span className="text-sm text-gray-700">Samma som leveransadress</span>
          </label>
          {!sameAddress && (
            <div className="space-y-4">
              <div>
                <label className={lc}>Gatuadress</label>
                <input name="billingAddress" className={ic} placeholder="Storgatan 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Postnummer</label>
                  <input name="billingPostalCode" className={ic} placeholder="12345" />
                </div>
                <div>
                  <label className={lc}>Stad</label>
                  <input name="billingCity" className={ic} placeholder="Stockholm" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Betala */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">4</span>
            Betalning
          </h2>
          <div className="p-4 bg-sage-50 border border-sage-100 rounded-xl text-sm text-gray-600 flex items-center gap-3">
            <Lock className="h-4 w-4 text-green-600 shrink-0" />
            Du skickas vidare till Stripes säkra betalningssida för att genomföra köpet.
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white text-sm font-bold rounded-2xl hover:bg-green-700 disabled:opacity-60 transition-colors shadow-md shadow-green-200/50"
        >
          <Lock className="h-4 w-4" />
          {loading ? "Skickar till betalning…" : `Betala ${formatPrice(orderTotal)}`}
        </button>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-green-600" />
            Leverans 2–4 vardagar
          </div>
          <div className="flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-sage-500" />
            14 dagars öppet köp
          </div>
        </div>
      </div>

      {/* ── ORDERÖVERSIKT ─────────────────────────── */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Din beställning</h2>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 bg-sage-50 rounded-lg overflow-hidden border border-sage-100">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-5 w-5 text-sage-200" />
                    </div>
                  )}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {discountCode && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">{discountCode}</span>
              <span className="ml-auto">–{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="space-y-1.5 text-sm border-t border-sage-100 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Delsumma</span><span>{formatPrice(total)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Rabatt</span><span>–{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Frakt</span>
              <span>{shipping === 0 ? <span className="text-green-600 font-medium">Gratis</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-sage-100 pt-2">
              <span>Totalt</span><span>{formatPrice(orderTotal)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">inkl. moms</p>
          </div>
        </div>
      </div>
    </form>
  );
}
