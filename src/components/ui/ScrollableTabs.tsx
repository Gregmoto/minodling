"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ── Typer ─────────────────────────────────────────────────────────

export interface TabItem {
  id:      string;
  label:   string;
  icon?:   ReactNode;
  badge?:  number | string;
  disabled?: boolean;
}

interface ScrollableTabsProps {
  tabs:          TabItem[];
  activeId:      string;
  onSelect:      (id: string) => void;
  /** Sticky mot toppen – ange top-offset i px */
  sticky?:       boolean;
  stickyTop?:    number;
  /** Bakgrundsfärg på sticky-rad */
  stickyBg?:     string;
  className?:    string;
  /** Storlek på pills */
  size?:         "sm" | "md" | "lg";
}

// ── Stilmap ───────────────────────────────────────────────────────

const sizeStyles = {
  sm: { pill: "h-7  px-3   text-xs  gap-1",   badge: "text-[9px]  px-1"   },
  md: { pill: "h-8  px-4   text-sm  gap-1.5", badge: "text-[10px] px-1.5" },
  lg: { pill: "h-10 px-5   text-sm  gap-2",   badge: "text-xs     px-2"   },
};

// ── Komponent ─────────────────────────────────────────────────────

export function ScrollableTabs({
  tabs,
  activeId,
  onSelect,
  sticky     = true,
  stickyTop  = 0,
  stickyBg   = "bg-white",
  className,
  size       = "md",
}: ScrollableTabsProps) {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const activeRef  = useRef<HTMLButtonElement | null>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sz = sizeStyles[size];

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows, tabs.length]);

  // Scrolla aktiv tab in i vy vid ändringar
  useEffect(() => {
    const el = scrollRef.current;
    const btn = activeRef.current;
    if (!el || !btn) return;

    const elLeft  = el.getBoundingClientRect().left;
    const btnLeft = btn.getBoundingClientRect().left;
    const btnRight = btnLeft + btn.offsetWidth;
    const elRight  = elLeft + el.offsetWidth;

    if (btnLeft < elLeft + 16) {
      el.scrollBy({ left: btnLeft - elLeft - 16, behavior: "smooth" });
    } else if (btnRight > elRight - 16) {
      el.scrollBy({ left: btnRight - elRight + 16, behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <div
      className={cn(
        sticky && "sticky z-20",
        className,
      )}
      style={sticky ? { top: stickyTop } : undefined}
    >
      <div className={cn(
        "relative",
        sticky && [stickyBg, "border-b border-gray-100 shadow-xs py-2.5 px-1"],
      )}>

        {/* Fade-masker */}
        {canLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        )}
        {canRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        )}

        {/* Scrollbar */}
        <div
          ref={scrollRef}
          role="tablist"
          aria-label="Kategoriflikar"
          className={cn(
            "flex gap-2 overflow-x-auto",
            "scroll-smooth",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            "px-1",
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                role="tab"
                ref={isActive ? activeRef : null}
                aria-selected={isActive}
                aria-disabled={tab.disabled}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && onSelect(tab.id)}
                className={cn(
                  /* Base */
                  "flex-shrink-0 inline-flex items-center font-medium rounded-pill",
                  "transition-all duration-150 select-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1",
                  "disabled:pointer-events-none disabled:opacity-40",
                  "active:scale-[0.96]",
                  sz.pill,
                  /* Aktiv: grön bakgrund, vit text */
                  isActive
                    ? "bg-green-500 text-white shadow-green"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800",
                )}>

                {/* Ikon */}
                {tab.icon && (
                  <span className="flex-shrink-0 opacity-80">{tab.icon}</span>
                )}

                {tab.label}

                {/* Badge */}
                {tab.badge !== undefined && (
                  <span className={cn(
                    "rounded-full font-semibold leading-none py-0.5 ml-0.5",
                    sz.badge,
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-gray-200 text-gray-500",
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Förinställd konfiguration med exempelfliken ────────────────────

export const PLANT_DETAIL_TABS: TabItem[] = [
  { id: "planting-calendar", label: "Planteringskalender" },
  { id: "difficulty",        label: "Svårighetsgrad" },
  { id: "location",          label: "Lämplig plats" },
  { id: "soil",              label: "Jordförberedelse" },
  { id: "timeline",          label: "Tillväxtperiod" },
  { id: "how-tos",           label: "Odlingsguider" },
  { id: "faq",               label: "FAQ" },
  { id: "benefits",          label: "Näringsvärden" },
];
