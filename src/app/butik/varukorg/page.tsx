"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package, Tag, X,
} from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { validateDiscount } from "@/app/butik/actions";
import { formatPrice } from "@/lib/utils";

export default function VarukorgsPage() {
  const { items, count, total, shipping, shippingCost, freeShippingThreshold, removeItem, updateQty } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{ code: string; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);

  const discountAmount = discountApplied?.amount ?? 0;
  const orderTotal = Math.max(0, total + shipping - discountAmount);

  async function applyDiscount() {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError("");
    const result = await validateDiscount(discountCode.trim(), total + shipping);
    if (result.success && result.discountAmount !== undefined) {
      setDiscountApplied({ code: discountCode.trim().toUpperCase(), amount: result.discountAmount });
      setDiscountCode("");
    } else {
      setDiscountError(result.error ?? "Ogiltig kod");
    }
    setDiscountLoading(false);
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-cream-50">
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center">
            <ShoppingBag className="h-20 w-20 text-sage-200 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Varukorgen är tom</h1>
            <p className="text-gray-500 mb-6">Lägg till produkter från butiken för att fortsätta.</p>
            <Link
              href="/butik"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Gå till butiken <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Varukorg
            <span className="ml-2 text-base sm:text-lg text-gray-400 font-normal">({count} {count === 1 ? "vara" : "varor"})</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Produktlista */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 sm:gap-4 bg-white rounded-2xl border border-sage-100 shadow-sm p-3 sm:p-4"
                >
                  {/* Bild */}
                  <Link href={`/butik/produkt/${item.slug}`} className="shrink-0">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 bg-sage-50 rounded-xl overflow-hidden border border-sage-100">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-sage-200" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/butik/produkt/${item.slug}`}
                      className="font-semibold text-gray-900 hover:text-green-700 transition-colors text-sm sm:text-base line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-sm text-green-700 font-medium mt-0.5">{formatPrice(item.price)}</p>
                  </div>

                  {/* Antal + ta bort */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        aria-label="Minska"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        aria-label="Öka"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 w-16 text-right hidden sm:block">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Ta bort"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/butik"
                className="block text-center text-sm text-gray-500 hover:text-green-700 transition-colors py-2"
              >
                ← Fortsätt handla
              </Link>
            </div>

            {/* Ordersammanfattning */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
                <h2 className="font-bold text-gray-900">Ordersammanfattning</h2>

                {/* Rabattkod */}
                <div>
                  {discountApplied ? (
                    <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xl text-sm">
                      <div className="flex items-center gap-1.5 text-green-700">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="font-medium">{discountApplied.code}</span>
                        <span className="text-green-600">–{formatPrice(discountApplied.amount)}</span>
                      </div>
                      <button
                        onClick={() => setDiscountApplied(null)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Ta bort rabattkod"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          value={discountCode}
                          onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                          placeholder="Rabattkod"
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                        <button
                          onClick={applyDiscount}
                          disabled={discountLoading || !discountCode.trim()}
                          className="px-3 py-2 text-sm font-medium bg-sage-100 text-sage-700 rounded-xl hover:bg-sage-200 disabled:opacity-50 transition-colors"
                        >
                          {discountLoading ? "…" : "Tillämpa"}
                        </button>
                      </div>
                      {discountError && (
                        <p className="text-xs text-red-600">{discountError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Summering */}
                <div className="space-y-2 text-sm border-t border-sage-100 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Delsumma</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Rabatt</span>
                      <span>–{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Frakt</span>
                    <span>
                      {shipping === 0
                        ? <span className="text-green-600 font-medium">Gratis</span>
                        : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="border-t border-sage-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                    <span>Totalt</span>
                    <span>{formatPrice(orderTotal)}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center">inkl. moms</p>
                </div>

                <Link
                  href={`/butik/kassa${discountApplied ? `?discount=${discountApplied.code}&discountAmount=${discountApplied.amount}` : ""}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200/50"
                >
                  Till kassan <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-center text-xs text-gray-400">Säker betalning via Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
