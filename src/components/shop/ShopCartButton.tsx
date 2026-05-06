"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/shop/CartContext";

/**
 * Floating cart button shown on all /butik pages.
 * Reads live item count from CartContext.
 */
export function ShopCartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/butik/varukorg"
      aria-label={`Varukorg – ${count} ${count === 1 ? "vara" : "varor"}`}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-green-600 text-white shadow-lg shadow-green-900/25 hover:bg-green-700 active:scale-95 transition-all sm:h-12 sm:w-12"
    >
      <ShoppingBag className="h-6 w-6 sm:h-5 sm:w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-gray-900 leading-none shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
