/**
 * Central konfiguration för Google AdSense.
 *
 * SLOT-ID:n hämtas i AdSense → Annonser → "Efter annonsenhet". Skapa en
 * displayannons per placering och klistra in dess data-ad-slot-värde här
 * (eller sätt motsvarande NEXT_PUBLIC_-variabel i Vercel).
 *
 * En tom slot gör att annonsen INTE renderas alls – tomma <ins>-element
 * bryter mot AdSense-policyn, så inget visas förrän ID:t är ifyllt.
 */

export const ADSENSE_CLIENT = "ca-pub-1402015911354425";

export const AD_SLOTS = {
  /** Toppbanner – horisontell, direkt under navigeringen */
  top:     process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP     ?? "",
  /** Sidokolumn – vertikal/kvadratisk i aside */
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
  /** I artikel – flytande annons mitt i innehållet */
  article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE ?? "",
  /** Ovanför footer – horisontell, sist på sidan */
  footer:  process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER  ?? "",
} as const;
