"use client";

import { Check, Truck } from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { formatPrice } from "@/lib/utils";

/**
 * Progress bar showing how far the customer is from free shipping.
 * Reads threshold, cost and total from CartContext (provided by butik layout).
 */
export function FreeShippingBanner() {
  const { total, shippingCost, freeShippingThreshold } = useCart();

  if (freeShippingThreshold <= 0) return null;

  const hasFreeSipping = total >= freeShippingThreshold;
  const left = freeShippingThreshold - total;
  const progress = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

  return (
    <div
      className={`w-full rounded-2xl border px-4 py-3 text-sm transition-colors ${
        hasFreeSipping
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {hasFreeSipping ? (
          <>
            <Check className="h-4 w-4 shrink-0 text-green-600" />
            <span className="font-medium">Du har fri frakt på den här beställningen! 🎉</span>
          </>
        ) : (
          <>
            <Truck className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Handla för{" "}
              <strong>{formatPrice(left)}</strong>
              {" "}till för fri frakt{total === 0 ? ` (frakt annars ${formatPrice(shippingCost)})` : ""}
            </span>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            hasFreeSipping ? "bg-green-500" : "bg-amber-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
