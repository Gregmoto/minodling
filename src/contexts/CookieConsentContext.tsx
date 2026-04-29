"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type CookieConsent,
  readConsent,
  writeConsent,
  CONSENT_ACCEPT_ALL,
  CONSENT_REJECT_ALL,
} from "@/lib/cookieConsent";

// ── Kontext-typ ───────────────────────────────────────────────────

interface CookieConsentContextValue {
  /** null = inget val gjort ännu, banner ska visas */
  consent:     CookieConsent | null;
  bannerOpen:  boolean;
  openBanner:  () => void;
  acceptAll:   () => void;
  rejectAll:   () => void;
  saveCustom:  (custom: Omit<CookieConsent, "necessary" | "savedAt">) => void;
}

// ── Kontext ───────────────────────────────────────────────────────

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent,    setConsent]    = useState<CookieConsent | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [hydrated,   setHydrated]   = useState(false);

  // Läs från localStorage vid mount (client only)
  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    // Visa banner om inget val gjorts
    if (!stored) setBannerOpen(true);
    setHydrated(true);
  }, []);

  const save = useCallback((partial: Omit<CookieConsent, "savedAt">) => {
    const full = writeConsent(partial);
    setConsent(full);
    setBannerOpen(false);
  }, []);

  const acceptAll  = useCallback(() => save({ ...CONSENT_ACCEPT_ALL }),  [save]);
  const rejectAll  = useCallback(() => save({ ...CONSENT_REJECT_ALL }),  [save]);
  const openBanner = useCallback(() => setBannerOpen(true), []);

  const saveCustom = useCallback(
    (custom: Omit<CookieConsent, "necessary" | "savedAt">) =>
      save({ necessary: true, ...custom }),
    [save],
  );

  // Rendera inte bannern alls förrän vi hydratiserat (undviker flash)
  if (!hydrated) {
    return (
      <CookieConsentContext.Provider
        value={{ consent, bannerOpen: false, openBanner, acceptAll, rejectAll, saveCustom }}>
        {children}
      </CookieConsentContext.Provider>
    );
  }

  return (
    <CookieConsentContext.Provider
      value={{ consent, bannerOpen, openBanner, acceptAll, rejectAll, saveCustom }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent måste användas inuti CookieConsentProvider");
  return ctx;
}
