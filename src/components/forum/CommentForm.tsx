"use client";

import { useState, useTransition, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { addComment } from "@/app/forum/actions";
import { Avatar } from "@/components/ui/Avatar";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  currentUserAvatar?: string | null;
  currentUsername?: string;
  placeholder?: string;
  onSuccess?: () => void;
}

export function CommentForm({
  postId,
  parentId,
  currentUserAvatar,
  currentUsername,
  placeholder = "Skriv en kommentar...",
  onSuccess,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || content.length < 2) {
      setError("Kommentaren är för kort");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await addComment(postId, content, parentId);
        setContent("");
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {currentUsername && (
        <Avatar
          src={currentUserAvatar}
          fallback={currentUsername}
          size="sm"
          className="shrink-0 mt-0.5"
        />
      )}
      <div className="flex-1">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isPending}
            rows={2}
            maxLength={2000}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="absolute right-2 bottom-2 p-1.5 text-green-600 hover:text-green-700 disabled:text-gray-300 transition-colors"
            aria-label="Skicka kommentar"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        <p className="text-xs text-gray-400 mt-1">Cmd+Enter för att skicka</p>
      </div>
    </form>
  );
}
