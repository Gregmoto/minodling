"use client";

import { Truck, Check } from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { formatPrice } from "@/lib/utils";

/**
 * Slim announcement bar showing free shipping progress.
 * Reads values from CartContext (provided by butik layout).
 */
export function FreeShippingBanner() {
  const { total, shippingCost, freeShippingThreshold } = useCart();

  if (freeShippingThreshold <= 0) return null;

  const hasFreeShipping = total >= freeShippingThreshold;
  const left = freeShippingThreshold - total;
  const progress = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

  return (
    <div className={`w-full text-xs ${hasFreeShipping ? "bg-green-600" : "bg-gray-800"}`}>
      <div className="container-main flex items-center justify-center gap-2 py-2 text-white">
        {hasFreeShipping ? (
          <>
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">Du har fri frakt på den här beställningen 🎉</span>
          </>
        ) : (
          <>
            <Truck className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span>
              Fri frakt från {formatPrice(freeShippingThreshold)} — handla för{" "}
              <strong className="font-semibold">{formatPrice(left)}</strong> till
            </span>
            {total > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <div className="h-1 w-20 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="opacity-60">{progress}%</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
