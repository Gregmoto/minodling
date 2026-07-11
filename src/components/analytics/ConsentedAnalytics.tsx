"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { readConsent, type CookieConsent } from "@/lib/cookieConsent";

/**
 * Renderar Vercel Analytics först efter att användaren gett samtycke till
 * statistik-cookies. Reagerar på "cookie-consent-updated" utan sidomladdning.
 */
export function ConsentedAnalytics() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    function onUpdate(e: Event) {
      setConsent((e as CustomEvent<CookieConsent>).detail);
    }
    window.addEventListener("cookie-consent-updated", onUpdate);
    return () => window.removeEventListener("cookie-consent-updated", onUpdate);
  }, []);

  if (!consent?.analytics) return null;
  return <Analytics />;
}
