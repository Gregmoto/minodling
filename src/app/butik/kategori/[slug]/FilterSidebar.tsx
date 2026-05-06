"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface Plant {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  plants: Plant[];
  /** Aktiva filtervärden */
  sort: string;
  prisMin: string;
  prisMax: string;
  svarighet: string;
  odling: string;
  vaxt: string;
  lager: boolean;
  hasActiveFilters: boolean;
}

const SORT_OPTIONS = [
  { value: "nyast",    label: "Nyast" },
  { value: "pris-asc", label: "Lägst pris" },
  { value: "pris-hog", label: "Högst pris" },
] as const;

const DIFFICULTY_OPTIONS = [
  { value: "easy",   label: "🌱 Nybörjarvänlig" },
  { value: "medium", label: "🌿 Medel" },
  { value: "hard",   label: "🌳 Avancerad" },
];

const GROWING_OPTIONS = [
  { value: "balkong",    label: "🏠 Balkong" },
  { value: "växthus",   label: "🏡 Växthus" },
  { value: "trädgård",  label: "🌳 Trädgård" },
  { value: "inomhus",   label: "🪴 Inomhus" },
  { value: "kolonilott", label: "🌱 Kolonilott" },
];

export function FilterSidebar({
  plants,
  sort,
  prisMin,
  prisMax,
  svarighet,
  odling,
  vaxt,
  lager,
  hasActiveFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      // Ta alltid bort sida vid filterändring
      p.delete("sida");
      Object.entries(overrides).forEach(([k, v]) => {
        if (v) p.set(k, v);
        else p.delete(k);
      });
      return `${pathname}?${p.toString()}`;
    },
    [pathname, searchParams]
  );

  function navigate(overrides: Record<string, string>) {
    startTransition(() => {
      router.push(buildUrl(overrides));
    });
  }

  const filterLink = (key: string, value: string, current: string) => {
    const isActive = current === value;
    return {
      href: buildUrl({ [key]: isActive ? "" : value }),
      active: isActive,
    };
  };

  return (
    <aside className="lg:w-60 shrink-0">
      <div className="sticky top-24 space-y-6">

        {/* Rubrik + rensa */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </h2>
          {hasActiveFilters && (
            <a
              href={pathname}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <X className="h-3 w-3" /> Rensa
            </a>
          )}
        </div>

        {/* Sortering */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sortering</h3>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value || (!sort && opt.value === "nyast");
              return (
                <a
                  key={opt.value}
                  href={buildUrl({ sort: opt.value === "nyast" ? "" : opt.value })}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    active ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                  }`}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Pris */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pris (SEK)</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              navigate({
                prisMin: fd.get("prisMin") as string ?? "",
                prisMax: fd.get("prisMax") as string ?? "",
              });
            }}
            className="space-y-2"
          >
            <div className="flex gap-2 items-center">
              <input
                name="prisMin"
                type="number"
                min={0}
                step={1}
                defaultValue={prisMin}
                placeholder="Min"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
              <span className="text-gray-400 text-xs">–</span>
              <input
                name="prisMax"
                type="number"
                min={0}
                step={1}
                defaultValue={prisMax}
                placeholder="Max"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 text-xs font-medium bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors"
            >
              Tillämpa pris
            </button>
            {(prisMin || prisMax) && (
              <button
                type="button"
                onClick={() => navigate({ prisMin: "", prisMax: "" })}
                className="w-full py-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                × Rensa pris
              </button>
            )}
          </form>
        </div>

        {/* Svårighetsgrad */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Svårighetsgrad</h3>
          <div className="space-y-0.5">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const { href, active } = filterLink("svarighet", opt.value, svarighet);
              return (
                <a
                  key={opt.value}
                  href={href}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    active ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                  }`}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Odlingstyp */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Odlingstyp</h3>
          <div className="space-y-0.5">
            {GROWING_OPTIONS.map((opt) => {
              const { href, active } = filterLink("odling", opt.value, odling);
              return (
                <a
                  key={opt.value}
                  href={href}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    active ? "bg-green-600 text-white font-medium" : "text-gray-700 hover:bg-sage-50"
                  }`}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Kopplad växt */}
        {plants.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kopplad växt</h3>
            <select
              value={vaxt}
              onChange={(e) => navigate({ vaxt: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
            >
              <option value="">Alla växter</option>
              {plants.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Finns i lager */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              onClick={() => navigate({ lager: lager ? "" : "1" })}
              className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
                lager ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  lager ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Endast i lager
            </span>
          </label>
        </div>

      </div>
    </aside>
  );
}
