"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer ─────────────────────────────────────────────────────────

export interface FaqItem {
  id:       string;
  question: string;
  answer:   string;
}

export interface FaqSectionProps {
  items:          FaqItem[];
  /** Hur många frågor som visas innan "Visa alla" */
  previewCount?:  number;
  /** Rubrik */
  title?:         string;
  className?:     string;
}

// ── SEO: FAQPage JSON-LD ──────────────────────────────────────────

function FaqSchema({ items }: { items: FaqItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: items.map((item) => ({
      "@type":          "Question",
      name:             item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text:    item.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Accordion-item ────────────────────────────────────────────────

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item:     FaqItem;
  isOpen:   boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn(
      "rounded-2xl border bg-white overflow-hidden transition-shadow duration-200",
      isOpen
        ? "border-green-200 shadow-sm"
        : "border-gray-100 hover:border-gray-200",
    )}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-start gap-3 px-5 py-4 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-inset",
          "transition-colors duration-150",
          isOpen ? "bg-green-50/50" : "hover:bg-gray-50/60",
        )}
      >
        {/* Fråga-ikon */}
        <HelpCircle className={cn(
          "h-4 w-4 mt-0.5 shrink-0 transition-colors",
          isOpen ? "text-green-500" : "text-gray-300",
        )} />

        {/* Frågetext */}
        <span className={cn(
          "flex-1 text-sm font-semibold leading-snug transition-colors",
          isOpen ? "text-green-800" : "text-gray-800",
        )}>
          {item.question}
        </span>

        {/* Pil */}
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 mt-0.5 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180 text-green-500",
        )} />
      </button>

      {/* Svar */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
      )}>
        <div className="px-5 pb-5 pt-0">
          {/* Separator */}
          <div className="h-px bg-green-100 mb-4" />
          <p className="text-sm text-gray-600 leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Huvudkomponent ────────────────────────────────────────────────

export function FaqSection({
  items,
  previewCount = 4,
  title        = "Vanliga frågor",
  className,
}: FaqSectionProps) {
  const [openId,      setOpenId]      = useState<string | null>(null);
  const [showAll,     setShowAll]     = useState(false);

  const visibleItems = showAll ? items : items.slice(0, previewCount);
  const hasMore      = items.length > previewCount;

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* SEO schema – renderas alltid med alla frågor */}
      <FaqSchema items={items} />

      {/* Rubrik */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400">{items.length} frågor</span>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {visibleItems.map((item) => (
          <FaqItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>

      {/* Visa alla / Visa färre */}
      {hasMore && (
        <button
          onClick={() => {
            setShowAll((v) => !v);
            // Stäng eventuellt öppen fråga utanför preview när vi kollapsar
            if (showAll && openId) {
              const idx = items.findIndex((i) => i.id === openId);
              if (idx >= previewCount) setOpenId(null);
            }
          }}
          className={cn(
            "w-full py-3 rounded-2xl text-sm font-semibold",
            "border border-gray-200 text-gray-600",
            "hover:border-green-300 hover:text-green-700 hover:bg-green-50",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400",
          )}
        >
          {showAll
            ? `↑ Visa färre`
            : `Visa alla ${items.length} frågor`}
        </button>
      )}
    </div>
  );
}
