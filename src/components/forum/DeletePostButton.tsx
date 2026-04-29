"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/app/forum/actions";

interface DeletePostButtonProps {
  postId: string;
  isMod: boolean;
}

export function DeletePostButton({ postId, isMod }: DeletePostButtonProps) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deletePost(postId);
    });
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
        title={isMod ? "Radera inlägg (mod)" : "Radera inlägg"}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Säker?</span>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {isPending ? "Raderar..." : "Ja, radera"}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        Avbryt
      </button>
    </div>
  );
}
