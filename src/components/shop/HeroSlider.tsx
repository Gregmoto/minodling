"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
}

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, paused, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden bg-sage-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Bild */}
      <div className="relative h-[380px] sm:h-[480px] lg:h-[560px] w-full">
        {slide.imageUrl ? (
          <>
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority
              className="object-cover transition-opacity duration-700"
              sizes="100vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sage-800 to-sage-600" />
        )}

        {/* Innehåll */}
        <div className="absolute inset-0 flex items-center">
          <div className="container-main w-full">
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-sm">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="mt-3 text-base sm:text-lg text-white/85 leading-relaxed">
                  {slide.subtitle}
                </p>
              )}
              {slide.buttonText && slide.buttonUrl && (
                <div className="mt-6">
                  <Link
                    href={slide.buttonUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-colors shadow-lg text-sm sm:text-base"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigeringsppilar */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              aria-label="Föregående slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              aria-label="Nästa slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dot-indikatorer */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Gå till slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
