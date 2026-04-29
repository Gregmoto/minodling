"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer ─────────────────────────────────────────────────────────

export interface Category {
  id:       string;
  name:     string;
  imageUrl?: string | null;
  /** Emoji som fallback om ingen bild */
  emoji?:   string;
  count?:   number;
}

interface CategoryScrollerProps {
  categories:        Category[];
  activeId?:         string | null;
  onSelect?:         (id: string) => void;
  /** Inkludera ett "Alla"-alternativ först */
  showAll?:          boolean;
  allLabel?:         string;
  allEmoji?:         string;
  className?:        string;
  /** Dölj nav-pilar (syns ändå inte på touch) */
  hideArrows?:       boolean;
}

// ── Komponent ─────────────────────────────────────────────────────

export function CategoryScroller({
  categories,
  activeId     = null,
  onSelect,
  showAll      = true,
  allLabel     = "Alla",
  allEmoji     = "🌿",
  className,
  hideArrows   = false,
}: CategoryScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Bygg den fullständiga listan
  const items: Category[] = showAll
    ? [{ id: "", name: allLabel, emoji: allEmoji }, ...categories]
    : categories;

  // Uppdatera pil-tillstånd
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
  }, [updateArrows, items.length]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  }

  return (
    <div className={cn("relative group/scroller", className)}>
      {/* Vänsterpil */}
      {!hideArrows && canLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scrolla vänster"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10",
            "h-9 w-9 rounded-full bg-white border border-gray-200 shadow-soft",
            "flex items-center justify-center",
            "text-gray-500 hover:text-gray-800 hover:shadow-card-hover",
            "transition-all duration-150",
            "opacity-0 group-hover/scroller:opacity-100",
            "-translate-x-1/2",
          )}>
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Högerpil */}
      {!hideArrows && canRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scrolla höger"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10",
            "h-9 w-9 rounded-full bg-white border border-gray-200 shadow-soft",
            "flex items-center justify-center",
            "text-gray-500 hover:text-gray-800 hover:shadow-card-hover",
            "transition-all duration-150",
            "opacity-0 group-hover/scroller:opacity-100",
            "translate-x-1/2",
          )}>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Fade-masker */}
      {canLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-[5] pointer-events-none" />
      )}
      {canRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-[5] pointer-events-none" />
      )}

      {/* Scrollbar – dold men touch-vänlig */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 overflow-x-auto",
          "scroll-smooth",
          /* Dölj scrollbar i alla webbläsare */
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          /* Padding för att pilar/fade inte klipper kort */
          "px-1 py-2",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}>
        {items.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isActive={activeId === cat.id}
            onClick={() => onSelect?.(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Kort ──────────────────────────────────────────────────────────

function CategoryCard({
  category,
  isActive,
  onClick,
}: {
  category: Category;
  isActive:  boolean;
  onClick:   () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        /* Fastlagd storlek – 120 × 140 px */
        "flex-shrink-0 w-[120px] h-[140px]",
        "flex flex-col items-center justify-end pb-3 gap-2",
        "rounded-2xl overflow-hidden relative",
        "border-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2",
        "active:scale-[0.96]",
        isActive
          ? "border-green-500 shadow-green"
          : "border-gray-100 hover:border-gray-300 bg-gray-50",
      )}>

      {/* Bild / Emoji */}
      {category.imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.imageUrl}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </>
      ) : (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center text-4xl",
          isActive ? "bg-green-50" : "bg-gray-50",
        )}>
          {category.emoji ?? "🌱"}
        </div>
      )}

      {/* Namn */}
      <span className={cn(
        "relative z-10 text-xs font-semibold leading-tight text-center px-1.5",
        "line-clamp-2 max-w-full",
        category.imageUrl ? "text-white drop-shadow-sm" : isActive ? "text-green-800" : "text-gray-700",
      )}>
        {category.name}
      </span>

      {/* Räknare (valfri) */}
      {category.count !== undefined && (
        <span className={cn(
          "relative z-10 text-[10px] leading-none",
          category.imageUrl ? "text-white/80" : "text-gray-400",
        )}>
          {category.count}
        </span>
      )}
    </button>
  );
}
