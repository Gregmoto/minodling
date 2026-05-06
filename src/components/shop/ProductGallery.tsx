"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface Props {
  mainImage: string | null;
  gallery: string[];
  name: string;
}

export function ProductGallery({ mainImage, gallery, name }: Props) {
  // Bygg en komplett bildlista: primärbild + galleri (utan dubletter)
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...gallery.filter((url) => url !== mainImage),
  ];

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const current = allImages[active] ?? null;
  const hasPrev = active > 0;
  const hasNext = active < allImages.length - 1;

  function prev() { if (hasPrev) setActive((i) => i - 1); }
  function next() { if (hasNext) setActive((i) => i + 1); }

  return (
    <div className="space-y-3">
      {/* Huvudbild */}
      <div className="relative aspect-square bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden group">
        {current ? (
          <>
            <Image
              src={current}
              alt={`${name}${allImages.length > 1 ? ` – bild ${active + 1}` : ""}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Zoom-ikon */}
            <button
              onClick={() => setZoomed(true)}
              className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
              aria-label="Förstora bild"
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </button>
            {/* Pil-navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  disabled={!hasPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white disabled:opacity-30 transition-all"
                  aria-label="Föregående bild"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  onClick={next}
                  disabled={!hasNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white disabled:opacity-30 transition-all"
                  aria-label="Nästa bild"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              </>
            )}
            {/* Bildräknare */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? "w-5 bg-green-600" : "w-1.5 bg-white/70"
                    }`}
                    aria-label={`Bild ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-24 w-24 text-sage-200" />
          </div>
        )}
      </div>

      {/* Miniatyrer */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-green-500 shadow-md"
                  : "border-sage-100 hover:border-sage-300"
              }`}
              aria-label={`Visa bild ${i + 1}`}
            >
              <Image
                src={url}
                alt={`${name} – miniatyr ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && current && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none"
            aria-label="Stäng"
          >
            ×
          </button>
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full">
            <Image
              src={current}
              alt={name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                disabled={!hasPrev}
                className="absolute left-4 p-3 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                disabled={!hasNext}
                className="absolute right-4 p-3 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
