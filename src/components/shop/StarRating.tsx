"use client";

import { Star } from "lucide-react";

interface Props {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (n: number) => void;
}

const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

export function StarRating({
  rating,
  size = "md",
  interactive = false,
  onRate,
}: Props) {
  const s = sizes[size];
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${s} transition-colors ${
            n <= rounded
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-200 fill-gray-200"
          } ${interactive ? "cursor-pointer hover:text-yellow-300 hover:fill-yellow-300" : ""}`}
          onClick={
            interactive && onRate ? () => onRate(n) : undefined
          }
        />
      ))}
    </div>
  );
}
