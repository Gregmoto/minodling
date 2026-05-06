"use client";

import { useState, useTransition } from "react";
import { StarRating } from "./StarRating";
import { submitReview } from "@/app/butik/actions";

interface Props {
  productId: string;
  productName: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
  } | null;
}

export function ReviewForm({ productId, productName, existingReview }: Props) {
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState<number>(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displayRating = hovered || rating;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Välj ett betyg 1–5.");
      return;
    }
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("productId", productId);
    fd.set("rating", String(rating));

    startTransition(async () => {
      const result = await submitReview(fd);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Något gick fel.");
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
        <p className="text-green-700 font-semibold">Tack för ditt omdöme!</p>
        <p className="text-green-600 text-sm mt-1">
          Det granskas av oss innan det publiceras.
        </p>
      </div>
    );
  }

  const ratingLabels: Record<number, string> = {
    1: "Dålig",
    2: "Okej",
    3: "Bra",
    4: "Mycket bra",
    5: "Utmärkt",
  };

  return (
    <div className="rounded-xl bg-white border border-sage-100 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {existingReview ? "Redigera ditt omdöme" : "Lämna ett omdöme"}
      </h3>
      <p className="text-sm text-gray-500 mb-4">{productName}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Betyg <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  className="focus:outline-none"
                  aria-label={`${n} stjärnor`}
                >
                  <StarRating
                    rating={n <= displayRating ? n : 0}
                    size="lg"
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <span className="text-sm text-gray-600 font-medium">
                {ratingLabels[displayRating]}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rubrik
          </label>
          <input
            name="title"
            type="text"
            defaultValue={existingReview?.title ?? ""}
            placeholder="Sammanfatta ditt omdöme"
            maxLength={100}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ditt omdöme
          </label>
          <textarea
            name="content"
            rows={4}
            defaultValue={existingReview?.content ?? ""}
            placeholder="Berätta om din upplevelse av produkten…"
            maxLength={2000}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {pending
            ? "Skickar…"
            : existingReview
            ? "Uppdatera omdöme"
            : "Skicka omdöme"}
        </button>
      </form>
    </div>
  );
}
