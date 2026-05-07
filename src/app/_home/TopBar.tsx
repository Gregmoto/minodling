"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Truck, Tag } from "lucide-react";

interface TopBarProps {
  freeShippingThreshold: number | null; // i öre
  message?: string | null;
}

export function TopBar({ freeShippingThreshold, message }: TopBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const thresholdKr = freeShippingThreshold ? Math.round(freeShippingThreshold / 100) : null;

  const text = message?.trim()
    || (thresholdKr ? `🚚 Fri frakt på order över ${thresholdKr} kr` : "🚚 Fri frakt – se villkor i butiken");

  return (
    <div className="relative bg-green-700 text-white text-sm py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Truck className="h-3.5 w-3.5 shrink-0" />
        <Link href="/butik" className="hover:underline font-medium leading-tight text-center">
          {text}
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-green-600 flex items-center justify-center transition-colors"
        aria-label="Stäng"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
