/**
 * Cookie-samtycke – typer och storage-hjälpare
 *
 * Consent sparas i localStorage under STORAGE_KEY.
 * Nödvändiga cookies är alltid aktiva och kan inte avaktiveras.
 */

export interface CookieConsent {
  necessary:  true;       // alltid true
  analytics:  boolean;
  functional: boolean;
  marketing:  boolean;
  savedAt:    number;     // unix timestamp
}

export const STORAGE_KEY = "minodling_cookie_consent";

// ── Förinställda val ──────────────────────────────────────────────

export const CONSENT_ACCEPT_ALL: CookieConsent = {
  necessary:  true,
  analytics:  true,
  functional: true,
  marketing:  true,
  savedAt:    0,
};

export const CONSENT_REJECT_ALL: CookieConsent = {
  necessary:  true,
  analytics:  false,
  functional: false,
  marketing:  false,
  savedAt:    0,
};

// ── Storage-operationer (körs bara client-side) ───────────────────

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    // Validera att det är en rimlig struktur
    if (typeof parsed.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(consent: Omit<CookieConsent, "savedAt">): CookieConsent {
  const full: CookieConsent = { ...consent, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  // Skicka event så att AnalyticsScripts kan reagera direkt
  window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: full }));
  return full;
}

export function clearConsent() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Tar bort Google Analytics-cookies (_ga, _gid, _gat, _ga_*) när användaren
 * återkallar sitt statistik-samtycke. Redan laddad gtag slutar då spåra
 * mellan sidladdningar.
 */
export function clearAnalyticsCookies() {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  // Domänvarianter så att cookies satta på .exempel.se också träffas
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  const paths = ["/"];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name) continue;
    if (name === "_ga" || name === "_gid" || name === "_gat" || name.startsWith("_ga_") || name.startsWith("_gat_")) {
      for (const domain of domains) {
        for (const path of paths) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ""}`;
        }
      }
    }
  }
}

// ── Kategoribeskrivningar ─────────────────────────────────────────

export const CONSENT_CATEGORIES = [
  {
    key:         "necessary" as const,
    label:       "Nödvändiga",
    description: "Krävs för att webbplatsen ska fungera – inloggning, sessioner och säkerhet. Kan inte avaktiveras.",
    alwaysOn:    true,
  },
  {
    key:         "analytics" as const,
    label:       "Statistik",
    description: "Hjälper oss förstå hur besökare använder sajten (Google Analytics). Data är anonymiserad.",
    alwaysOn:    false,
  },
  {
    key:         "functional" as const,
    label:       "Funktionella",
    description: "Kommer ihåg dina preferenser, t.ex. tema och språkval, för en bättre upplevelse.",
    alwaysOn:    false,
  },
  {
    key:         "marketing" as const,
    label:       "Marknadsföring",
    description: "Används för att mäta annonseffektivitet (Bing/Microsoft). Aktivt endast vid kampanjer.",
    alwaysOn:    false,
  },
] as const;
