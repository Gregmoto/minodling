"use client";

// Öppnar Googles samtyckesdialog ("European regulations message" / Funding Choices)
// så att besökare kan ändra sitt annons- och cookiesamtycke i efterhand.
declare global {
  interface Window {
    googlefc?: { showRevocationMessage?: () => void };
  }
}

export function CookieSettingsButton() {
  return (
    <button
      onClick={() => window.googlefc?.showRevocationMessage?.()}
      className="text-sm text-gray-500 hover:text-green-700 transition-colors text-left">
      Annons- &amp; cookieinställningar
    </button>
  );
}
