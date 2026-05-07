"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";

// ── Statiska nav-poster ──────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",           href: "/admin",                        group: "Navigering" },
  { label: "Användare",           href: "/admin/anvandare",              group: "Navigering" },
  { label: "Roller",              href: "/admin/roller",                 group: "Navigering" },
  { label: "Moderatorer",         href: "/admin/moderatorer",            group: "Navigering" },
  { label: "Kontaktärenden",      href: "/admin/kontakt",                group: "Navigering" },
  { label: "Inlägg",              href: "/admin/inlagg",                 group: "Navigering" },
  { label: "Kommentarer",         href: "/admin/kommentarer",            group: "Navigering" },
  { label: "Frågor & svar",       href: "/admin/fragor",                 group: "Navigering" },
  { label: "Växtdatabas",         href: "/admin/vaxter",                 group: "Navigering" },
  { label: "Odlingskalender",     href: "/admin/kalender",               group: "Navigering" },
  { label: "Guider",              href: "/admin/guider",                 group: "Navigering" },
  { label: "Kunskapsbank",        href: "/admin/kunskapsbank",           group: "Navigering" },
  { label: "Ordlista",            href: "/admin/ordlista",               group: "Navigering" },
  { label: "Butik – Översikt",    href: "/admin/butik",                  group: "Navigering" },
  { label: "Butik – Slides",      href: "/admin/butik/slides",           group: "Navigering" },
  { label: "Butik – Startsida",   href: "/admin/butik/startsida",        group: "Navigering" },
  { label: "Butik – Meny",        href: "/admin/butik/meny",             group: "Navigering" },
  { label: "Produkter",           href: "/admin/butik/produkter",        group: "Navigering" },
  { label: "Rekommendationer",    href: "/admin/butik/rekommendationer", group: "Navigering" },
  { label: "Kategorier",          href: "/admin/butik/kategorier",       group: "Navigering" },
  { label: "Ordrar",              href: "/admin/butik/ordrar",           group: "Navigering" },
  { label: "Kunder",              href: "/admin/butik/kunder",           group: "Navigering" },
  { label: "Rabattkoder",         href: "/admin/butik/rabattkoder",      group: "Navigering" },
  { label: "Omdömen",             href: "/admin/butik/omdomen",          group: "Navigering" },
  { label: "Nyhetsbrev",          href: "/admin/butik/nyhetsbrev",       group: "Navigering" },
  { label: "Butik – Inställningar", href: "/admin/butik/installningar",  group: "Navigering" },
  { label: "Banners",             href: "/admin/annonser",               group: "Navigering" },
  { label: "Poängsystem",         href: "/admin/poang",                  group: "Navigering" },
  { label: "Rapporter",           href: "/admin/rapporter",              group: "Navigering" },
  { label: "SEO",                 href: "/admin/seo",                    group: "Navigering" },
  { label: "Inställningar",       href: "/admin/installningar",          group: "Navigering" },
  { label: "AI-inställningar",    href: "/admin/installningar/ai",       group: "Navigering" },
];

// ── Typ för dynamiska sökresultat ────────────────────────────────────────────

interface SearchResult {
  label: string;
  href:  string;
  group: string;
  meta?: string;
}

// ── Komponent ────────────────────────────────────────────────────────────────

export function AdminSearch() {
  const router  = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  const [query,   setQuery]   = useState("");
  const [open,    setOpen]    = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active,  setActive]  = useState(0);
  const [loading, setLoading] = useState(false);

  // ── Filtrera nav-poster statiskt ─────────────────────────────────────────
  const filterNav = useCallback((q: string): SearchResult[] => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(lower)).slice(0, 5);
  }, []);

  // ── Dynamisk sökning mot API ─────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) { setResults([]); setActive(0); return; }

    const nav = filterNav(query);
    setResults(nav);

    if (query.length < 2) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          setResults([...nav, ...data]);
          setActive(0);
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, filterNav]);

  // ── Tangentbordsnavigering ───────────────────────────────────────────────
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown")  { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && results[active]) { navigate(results[active].href); }
    if (e.key === "Escape") { close(); }
  };

  const navigate = (href: string) => {
    router.push(href);
    close();
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  // ── Stäng vid klick utanför ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Ctrl+K / Cmd+K ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Gruppera resultat ────────────────────────────────────────────────────
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="relative flex-1 max-w-sm">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Sök… (⌘K)"
          className="w-full pl-8 pr-8 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
        />
        {query && (
          <button onClick={close} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {loading && !query && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          ref={dropRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto"
        >
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                {group}
              </div>
              {items.map((item, idx) => {
                const globalIdx = results.indexOf(item);
                return (
                  <button
                    key={item.href + idx}
                    onMouseEnter={() => setActive(globalIdx)}
                    onClick={() => navigate(item.href)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      active === globalIdx ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.meta && <span className="text-xs text-gray-400 truncate max-w-[120px]">{item.meta}</span>}
                    <ArrowRight className="h-3 w-3 shrink-0 text-gray-300" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Tom träff */}
      {open && query.length > 1 && !loading && results.length === 0 && (
        <div ref={dropRef} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 px-4 py-3 text-sm text-gray-500">
          Inga träffar för &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
