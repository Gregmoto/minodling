"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

interface Plant {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  difficultyLevel: string | null;
  category: string | null;
}

const DIFFICULTY: Record<string, { label: string; color: string }> = {
  easy:   { label: "Lätt",       color: "bg-green-100 text-green-700" },
  medium: { label: "Medel",      color: "bg-amber-100 text-amber-700" },
  hard:   { label: "Avancerad",  color: "bg-red-100   text-red-700"   },
};

export function PlantsScroll({ plants }: { plants: Plant[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
      {plants.map((p) => {
        const diff = DIFFICULTY[p.difficultyLevel ?? ""] ?? null;
        return (
          <Link
            key={p.id}
            href={`/vaxtdatabas/${p.slug}`}
            className="flex-none w-40 sm:w-44 snap-start group"
          >
            <div className="rounded-2xl overflow-hidden bg-sage-50 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
              <div className="aspect-square bg-gradient-to-br from-green-50 to-sage-100 flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <Leaf className="h-10 w-10 text-green-200" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-green-700 transition-colors">
                  {p.name}
                </p>
                {diff && (
                  <span className={`mt-1.5 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${diff.color}`}>
                    {diff.label}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
