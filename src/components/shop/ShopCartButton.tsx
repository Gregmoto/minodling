"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, Package, Check, Truck,
} from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { formatPrice } from "@/lib/utils";

export function ShopCartButton() {
  const [open, setOpen] = useState(false);
  const { items, count, total, shipping, shippingCost, freeShippingThreshold, removeItem, updateQty } = useCart();

  const orderTotal = total + shipping;
  const hasFreeSipping = total >= freeShippingThreshold;
  const left = freeShippingThreshold - total;
  const progress = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label={`Öppna varukorg – ${count} ${count === 1 ? "vara" : "varor"}`}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-green-600 text-white shadow-lg shadow-green-900/30 hover:bg-green-700 active:scale-95 transition-all"
      >
        <ShoppingBag className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-gray-900 leading-none shadow-sm">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Drawer ── */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-600" />
            <h2 className="font-bold text-gray-900">
              Varukorg
              {count > 0 && (
                <span className="ml-2 text-sm text-gray-400 font-normal">
                  {count} {count === 1 ? "vara" : "varor"}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Stäng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Fri frakt-bar */}
        {freeShippingThreshold > 0 && (
          <div className={`px-5 py-3 border-b text-xs ${hasFreeSipping ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              {hasFreeSipping ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span className="font-medium text-green-800">Fri frakt! 🎉</span>
                </>
              ) : (
                <>
                  <Truck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-800">
                    <strong>{formatPrice(left)}</strong> till för fri frakt
                  </span>
                </>
              )}
            </div>
            <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${hasFreeSipping ? "bg-green-500" : "bg-amber-400"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Produktlista */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-center">
              <ShoppingBag className="h-14 w-14 text-gray-200" />
              <p className="font-medium text-gray-500">Varukorgen är tom</p>
              <p className="text-sm text-gray-400">Lägg till produkter för att fortsätta</p>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 px-4 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-xl hover:bg-green-50 transition-colors"
              >
                Fortsätt handla
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                {/* Bild */}
                <Link href={`/butik/produkt/${item.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                  <div className="relative h-16 w-16 rounded-xl bg-sage-50 border border-sage-100 overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-5 w-5 text-sage-200" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/butik/produkt/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-gray-900 hover:text-green-700 line-clamp-2 leading-tight"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-green-700 font-semibold mt-0.5">{formatPrice(item.price)}</p>

                  {/* Antal-kontroller */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="h-6 w-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        aria-label="Minska"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="h-6 w-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        aria-label="Öka"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="h-6 w-6 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Ta bort"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Radsumma */}
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer – summering + knappar */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50/60">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Delsumma</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frakt</span>
                <span>
                  {shipping === 0
                    ? <span className="text-green-600 font-medium">Gratis</span>
                    : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2">
                <span>Totalt</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
              <p className="text-xs text-gray-400 text-right">inkl. moms</p>
            </div>

            <Link
              href="/butik/kassa"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200/60"
            >
              Till kassan <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/butik/varukorg"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-full py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-white transition-colors"
            >
              Visa hela varukorgen
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
