"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, AD_SLOTS } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdUnitProps {
  /** data-ad-slot från AdSense. Tom sträng → inget renderas. */
  slot: string;
  /** "auto" (display) eller "fluid" (i artikel) */
  format?: string;
  /** t.ex. "in-article" */
  layout?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Minsta höjd så att layouten inte hoppar när annonsen laddas (CLS) */
  minHeight?: number;
}

/**
 * Renderar en AdSense-annonsenhet.
 *
 * adsbygoogle-scriptet laddas globalt i <head> (se GoogleTags). Här pushas
 * bara en initiering per monterad enhet – ref-vakten hindrar dubbel-push,
 * som annars ger "All ins elements already have ads" i React StrictMode.
 *
 * Annonserna respekterar Consent Mode v2: utan samtycke visas
 * icke-personaliserade annonser (eller inga alls i EES).
 */
export function AdUnit({
  slot,
  format = "auto",
  layout,
  responsive = true,
  className,
  style,
  minHeight = 100,
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* adblockare eller script ej laddat – ignorera tyst */
    }
  }, [slot]);

  // Ingen slot konfigurerad → rendera inget alls (policy: inga tomma enheter)
  if (!slot) return null;

  return (
    <div className={className}>
      <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
        Annons
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight, ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// ── Namngivna placeringar ────────────────────────────────────────────

/** Toppbanner – horisontell, direkt under navigeringen */
export function AdTopBanner({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.top}
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 ${className}`}
      minHeight={90}
    />
  );
}

/** Sidokolumn – passar i <aside> */
export function AdSidebar({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.sidebar}
      className={className}
      minHeight={250}
      responsive={false}
    />
  );
}

/** I artikel – flytande annons mitt i innehållet */
export function AdInArticle({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.article}
      format="fluid"
      layout="in-article"
      className={`my-8 ${className}`}
      style={{ textAlign: "center" }}
      minHeight={200}
    />
  );
}

/** Ovanför footer – horisontell, sist på sidan */
export function AdAboveFooter({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.footer}
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ${className}`}
      minHeight={90}
    />
  );
}
