"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSave } from "@/app/forum/actions";

interface SaveButtonProps {
  postId: string;
  initialSaved: boolean;
}

export function SaveButton({ postId, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleSave(postId);
      setSaved(result.saved);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        saved
          ? "text-green-600 hover:text-green-700"
          : "text-gray-500 hover:text-green-600"
      }`}
      aria-label={saved ? "Ta bort sparad" : "Spara inlägg"}
    >
      <Bookmark className={`h-4 w-4 transition-all ${saved ? "fill-current" : ""}`} />
      <span className="hidden sm:inline">{saved ? "Sparad" : "Spara"}</span>
    </button>
  );
}
