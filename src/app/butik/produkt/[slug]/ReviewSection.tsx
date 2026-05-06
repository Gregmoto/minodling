"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, MessageSquare } from "lucide-react";
import { StarRating } from "@/components/shop/StarRating";
import { ReviewForm } from "@/components/shop/ReviewForm";
import { formatDate } from "@/lib/utils";

export interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  imageUrls: string[];
  isVerifiedPurchase: boolean;
  adminReply: string | null;
  adminRepliedAt: Date | null;
  createdAt: Date;
  user: { fullName: string | null; username: string } | null;
}

interface Props {
  productId: string;
  productName: string;
  reviews: ReviewData[];
  avgRating: number;
  totalCount: number;
  userReview: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
  } | null;
  isLoggedIn: boolean;
}

type FilterType = "all" | "5" | "4" | "3" | "2" | "1" | "verified" | "images";
type SortType = "newest" | "highest" | "lowest";

export function ReviewSection({
  productId,
  productName,
  reviews,
  avgRating,
  totalCount,
  userReview,
  isLoggedIn,
}: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");

  // Rating distribution
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) dist[r.rating] = (dist[r.rating] ?? 0) + 1;

  // Filter
  let filtered = reviews;
  if (filter === "verified") filtered = reviews.filter((r) => r.isVerifiedPurchase);
  else if (filter === "images") filtered = reviews.filter((r) => r.imageUrls.length > 0);
  else if (["5", "4", "3", "2", "1"].includes(filter))
    filtered = reviews.filter((r) => r.rating === parseInt(filter));

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return b.createdAt.valueOf() - a.createdAt.valueOf();
    if (sort === "highest") return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Alla" },
    { key: "5", label: "5★" },
    { key: "4", label: "4★" },
    { key: "3", label: "3★" },
    { key: "2", label: "2★" },
    { key: "1", label: "1★" },
    { key: "verified", label: "Verifierat" },
    { key: "images", label: "Med bild" },
  ];

  return (
    <section className="mt-16 pt-10 border-t border-sage-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="h-5 w-1 bg-yellow-400 rounded-full" />
        Omdömen
        {totalCount > 0 && (
          <span className="text-sm font-normal text-gray-400 ml-1">({totalCount})</span>
        )}
      </h2>

      {/* Summary */}
      {totalCount > 0 ? (
        <div className="flex flex-wrap items-start gap-8 mb-8 p-5 bg-white rounded-2xl border border-sage-100 shadow-sm">
          {/* Average */}
          <div className="text-center min-w-[80px]">
            <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            <StarRating rating={avgRating} size="md" />
            <p className="text-xs text-gray-400 mt-1">{totalCount} omdömen</p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 min-w-[180px] space-y-1.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = dist[n] ?? 0;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <button
                  key={n}
                  onClick={() =>
                    setFilter(filter === String(n) ? "all" : (String(n) as FilterType))
                  }
                  className="flex items-center gap-2 w-full group"
                >
                  <span className="text-xs text-gray-500 w-4 text-right">{n}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-left">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-2xl border border-sage-100 mb-8">
          <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Inga omdömen ännu. Bli först att recensera!</p>
        </div>
      )}

      {/* Filters + sort */}
      {totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {f.label}
                {f.key === "all" && <span className="ml-1 text-[10px] opacity-70">({totalCount})</span>}
                {["5", "4", "3", "2", "1"].includes(f.key) && (
                  <span className="ml-1 text-[10px] opacity-70">({dist[parseInt(f.key)] ?? 0})</span>
                )}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-sage-400"
          >
            <option value="newest">Nyast</option>
            <option value="highest">Högst betyg</option>
            <option value="lowest">Lägst betyg</option>
          </select>
        </div>
      )}

      {/* Review list */}
      {sorted.length > 0 && (
        <div className="space-y-4 mb-10">
          {sorted.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} size="sm" />
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Verifierat köp
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="font-semibold text-gray-900 text-sm">{review.title}</p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400 shrink-0">
                  <p>{review.user?.fullName ?? review.user?.username ?? "Anonym"}</p>
                  <p>{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {review.content && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.content}</p>
              )}

              {/* Images */}
              {review.imageUrls.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.imageUrls.slice(0, 3).map((url, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-16 rounded-xl overflow-hidden border border-sage-100 shrink-0"
                    >
                      <Image
                        src={url}
                        alt={`Bild ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                  {review.imageUrls.length > 3 && (
                    <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-xs text-gray-500 font-medium">
                      +{review.imageUrls.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Admin reply */}
              {review.adminReply && (
                <div className="mt-4 p-3.5 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-xs font-semibold text-green-700 mb-1.5">
                    Svar från butiken:
                    {review.adminRepliedAt && (
                      <span className="ml-2 font-normal text-green-600">
                        {formatDate(review.adminRepliedAt)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-green-800 leading-relaxed">{review.adminReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {sorted.length === 0 && totalCount > 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          Inga omdömen matchar filtret.
        </p>
      )}

      {/* Review form */}
      {isLoggedIn && (
        <div className="mt-4">
          <ReviewForm
            productId={productId}
            productName={productName}
            existingReview={userReview}
          />
        </div>
      )}

      {!isLoggedIn && (
        <div className="mt-4 rounded-xl bg-sage-50 border border-sage-200 p-5 text-center">
          <p className="text-sm text-gray-600">
            <a href="/logga-in" className="font-semibold text-green-700 hover:underline">
              Logga in
            </a>{" "}
            för att lämna ett omdöme.
          </p>
        </div>
      )}
    </section>
  );
}
