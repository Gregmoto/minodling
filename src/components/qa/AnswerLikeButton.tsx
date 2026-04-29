"use client";

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { toggleAnswerLike } from "@/app/fragor/actions";

interface Props {
  answerId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function AnswerLikeButton({ answerId, initialLiked, initialCount }: Props) {
  const [liked, setLiked]   = useState(initialLiked);
  const [count, setCount]   = useState(initialCount);
  const [isPending, start]  = useTransition();

  function handleClick() {
    start(async () => {
      const result = await toggleAnswerLike(answerId);
      setLiked(result.liked);
      setCount(result.count);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        liked ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-green-600"
      }`}
      aria-label={liked ? "Ta bort like" : "Gilla svaret"}
    >
      <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span>{count > 0 ? count : ""}</span>
    </button>
  );
}
