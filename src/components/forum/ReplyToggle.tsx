"use client";

import { useState } from "react";
import { CommentForm } from "@/components/forum/CommentForm";

interface ReplyToggleProps {
  postId: string;
  parentId: string;
  currentUserAvatar?: string | null;
  currentUsername: string;
}

export function ReplyToggle({ postId, parentId, currentUserAvatar, currentUsername }: ReplyToggleProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-green-700 transition-colors"
      >
        Svara
      </button>
    );
  }

  return (
    <CommentForm
      postId={postId}
      parentId={parentId}
      currentUserAvatar={currentUserAvatar}
      currentUsername={currentUsername}
      placeholder="Skriv ett svar..."
      onSuccess={() => setOpen(false)}
    />
  );
}
