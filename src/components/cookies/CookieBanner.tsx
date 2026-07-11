"use client";

import { useState } from "react";
import Link from "next/link";
import { Cookie, ChevronDown, ChevronUp, X } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { CONSENT_CATEGORIES } from "@/lib/cookieConsent";

export function CookieBanner() {
  const { bannerOpen, acceptAll, rejectAll, saveCustom, consent } = useCookieConsent();

  const [expanded, setExpanded] = useState(false);
  const [custom, setCustom] = useState({
    analytics:  false,
    functional: false,
    marketing:  false,
  });

  if (!bannerOpen) return null;

  function handleSaveCustom() {
    saveCustom(custom);
  }

  function handleToggle(key: "analytics" | "functional" | "marketing") {
    setCustom((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Förifyll toggles med befintligt samtycke när man öppnar anpassa-läget
  function handleOpenExpanded() {
    if (consent) {
      setCustom({
        analytics:  consent.analytics,
        functional: consent.functional,
        marketing:  consent.marketing,
      });
    }
    setExpanded(true);
  }

  return (
    <>
      {/* Backdrop – svag, bara i anpassa-läget */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/10 z-40 backdrop-blur-[1px]"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Bannern */}
      <div
        role="dialog"
        aria-label="Cookie-inställningar"
        aria-modal="true"
        className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 pointer-events-none">
        <div className="pointer-events-auto max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* Kompakt vy */}
          {!expanded && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Cookie className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Vi använder cookies för inloggning och för att förbättra din upplevelse.{" "}
                  <Link href="/cookies" className="text-green-700 hover:underline font-medium">
                    Läs mer
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleOpenExpanded()}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                  Anpassa
                </button>
                <button
                  onClick={rejectAll}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                  Neka icke-nödvändiga
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                  Acceptera alla
                </button>
              </div>
            </div>
          )}

          {/* Anpassa-vy */}
          {expanded && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-amber-500" />
                  <h2 className="font-semibold text-gray-900 text-sm">Anpassa cookies</h2>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Stäng cookie-inställningar"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Kategorier */}
              <div className="divide-y divide-gray-50 px-5 py-2">
                {CONSENT_CATEGORIES.map((cat) => {
                  const isChecked = cat.alwaysOn
                    ? true
                    : custom[cat.key as "analytics" | "functional" | "marketing"];

                  return (
                    <div key={cat.key} className="flex items-start gap-4 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                          {cat.alwaysOn && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded-md font-medium">
                              Alltid aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
                      </div>

                      {/* Toggle */}
                      <button
                        role="switch"
                        aria-checked={isChecked}
                        aria-label={`Aktivera ${cat.label}`}
                        disabled={cat.alwaysOn}
                        onClick={() => !cat.alwaysOn && handleToggle(cat.key as "analytics" | "functional" | "marketing")}
                        className={`relative flex-shrink-0 mt-0.5 h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 ${
                          isChecked ? "bg-green-500" : "bg-gray-200"
                        } ${cat.alwaysOn ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            isChecked ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer med knappar */}
              <div className="flex flex-col sm:flex-row items-center gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-400 flex-1 text-center sm:text-left">
                  <Link href="/cookies" className="text-green-700 hover:underline">
                    Läs mer om cookies
                  </Link>{" "}
                  ·{" "}
                  <Link href="/integritetspolicy" className="text-green-700 hover:underline">
                    Integritetspolicy
                  </Link>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={rejectAll}
                    className="px-3 py-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Neka alla
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-3 py-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Acceptera alla
                  </button>
                  <button
                    onClick={handleSaveCustom}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                    Spara val
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
