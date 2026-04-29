"use client";

import { useCookieConsent } from "@/contexts/CookieConsentContext";

export function CookieSettingsButton() {
  const { openBanner } = useCookieConsent();
  return (
    <button
      onClick={openBanner}
      className="text-sm text-gray-500 hover:text-green-700 transition-colors text-left">
      Cookieinställningar
    </button>
  );
}
