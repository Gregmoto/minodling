"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check, Package } from "lucide-react";
import { useCart, CartItem } from "./CartContext";

interface Props {
  product: Omit<CartItem, "quantity">;
}

export function BuyWidget({ product }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock === 0;
  const maxQty = Math.min(product.stock, 99);

  function decrement() { setQty((q) => Math.max(1, q - 1)); }
  function increment() { setQty((q) => Math.min(maxQty, q + 1)); }

  function handleAdd() {
    if (outOfStock) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (outOfStock) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <Package className="h-5 w-5 text-gray-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-600">Slut i lager</p>
          <p className="text-xs text-gray-400 mt-0.5">Bevaka produkten för att få besked när den är tillbaka.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Antal-väljare */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 w-12">Antal</span>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <button
            onClick={decrement}
            disabled={qty <= 1}
            className="px-3.5 py-2.5 text-gray-500 hover:bg-sage-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Minska antal"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-gray-900 select-none">
            {qty}
          </span>
          <button
            onClick={increment}
            disabled={qty >= maxQty}
            className="px-3.5 py-2.5 text-gray-500 hover:bg-sage-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Öka antal"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {product.stock <= 5 && (
          <span className="text-xs text-amber-600 font-medium">
            Bara {product.stock} kvar!
          </span>
        )}
      </div>

      {/* Lägg i varukorg-knapp */}
      <button
        onClick={handleAdd}
        className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-base font-semibold transition-all active:scale-[0.98] ${
          added
            ? "bg-green-500 text-white shadow-lg shadow-green-200"
            : "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200/50 hover:shadow-lg hover:shadow-green-200"
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Tillagd i varukorgen!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Lägg i varukorg {qty > 1 && `(${qty} st)`}
          </>
        )}
      </button>

      {/* Säkerhetstext */}
      <p className="text-center text-xs text-gray-400">
        Säker betalning · Fri frakt över 499 kr · 14 dagars öppet köp
      </p>
    </div>
  );
}
