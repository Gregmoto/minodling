"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/app/forum/actions";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleLike(postId);
      setLiked(result.liked);
      setCount(result.count);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        liked
          ? "text-red-500 hover:text-red-600"
          : "text-gray-500 hover:text-red-500"
      }`}
      aria-label={liked ? "Ta bort like" : "Gilla"}
    >
      <Heart className={`h-4 w-4 transition-all ${liked ? "fill-current" : ""}`} />
      <span>{count}</span>
    </button>
  );
}
