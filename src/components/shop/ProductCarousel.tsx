"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductCardData } from "@/components/shop/ProductCard";

interface Props {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  ctaText?: string;
  ctaHref?: string;
}

export function ProductCarousel({ title, subtitle, products, ctaText, ctaHref }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {ctaText && ctaHref && (
            <Link
              href={ctaHref}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-green-700 hover:underline"
            >
              {ctaText} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {/* Arrow buttons – desktop only */}
          <div className="hidden sm:flex gap-1">
            <button
              onClick={() => scrollBy(-320)}
              aria-label="Scrolla bakåt"
              className="h-8 w-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(320)}
              aria-label="Scrolla framåt"
              className="h-8 w-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable product row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-56 sm:w-64 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Mobile CTA */}
      {ctaText && ctaHref && (
        <div className="mt-4 sm:hidden text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline"
          >
            {ctaText} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
