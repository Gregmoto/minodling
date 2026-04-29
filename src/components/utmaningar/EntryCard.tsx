"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageSquare, Trash2, Loader2, Send } from "lucide-react";
import { deleteEntry, commentEntry, deleteChallengeComment } from "@/app/utmaningar/actions";
import { formatDate } from "@/lib/utils";

interface Profile { id: string; username: string | null; avatarUrl: string | null }
interface Comment { id: string; content: string; createdAt: Date; profile: Profile }
interface Entry {
  id: string; imageUrl: string; caption: string | null; createdAt: Date;
  profile: Profile;
  comments: Comment[];
}

export function EntryCard({
  entry,
  slug,
  currentProfileId,
  isAdmin,
}: {
  entry: Entry;
  slug: string;
  currentProfileId: string | null;
  isAdmin: boolean;
}) {
  const [showComments, setShowComments] = useState(false);
  const [isPending, start] = useTransition();

  const canDelete = currentProfileId === entry.profile.id || isAdmin;

  function handleDelete() {
    if (!confirm("Ta bort detta bidrag?")) return;
    start(() => deleteEntry(entry.id));
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.imageUrl} alt={entry.caption ?? "Bidrag"} className="w-full h-full object-cover" />
        {canDelete && (
          <button onClick={handleDelete} disabled={isPending}
            className="absolute top-2 right-2 p-1.5 bg-white/90 border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50">
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" /> : <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          {entry.profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.profile.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700 flex-shrink-0">
              {entry.profile.username?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <Link href={`/profil/${entry.profile.username}`}
              className="text-sm font-medium text-gray-800 hover:text-amber-700 transition-colors truncate block">
              {entry.profile.username}
            </Link>
            <p className="text-xs text-gray-400">{formatDate(entry.createdAt)}</p>
          </div>
        </div>

        {entry.caption && (
          <p className="text-sm text-gray-600 leading-relaxed">{entry.caption}</p>
        )}

        {/* Comments toggle */}
        <button onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors self-start">
          <MessageSquare className="h-3.5 w-3.5" />
          {entry.comments.length > 0 ? `${entry.comments.length} kommentar${entry.comments.length !== 1 ? "er" : ""}` : "Kommentera"}
        </button>

        {showComments && (
          <div className="space-y-3 border-t border-gray-50 pt-3">
            {entry.comments.map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                slug={slug}
                currentProfileId={currentProfileId}
                isAdmin={isAdmin}
              />
            ))}
            {currentProfileId && (
              <CommentForm entryId={entry.id} slug={slug} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  slug,
  currentProfileId,
  isAdmin,
}: {
  comment: Comment;
  slug: string;
  currentProfileId: string | null;
  isAdmin: boolean;
}) {
  const [isPending, start] = useTransition();
  const canDelete = currentProfileId === comment.profile.id || isAdmin;

  return (
    <div className="flex gap-2 group">
      {comment.profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={comment.profile.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
      ) : (
        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">
          {comment.profile.username?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-gray-700">{comment.profile.username} </span>
        <span className="text-xs text-gray-600">{comment.content}</span>
      </div>
      {canDelete && (
        <button onClick={() => start(() => deleteChallengeComment(comment.id, slug))}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {isPending ? <Loader2 className="h-3 w-3 animate-spin text-gray-400" /> : <Trash2 className="h-3 w-3 text-gray-300 hover:text-red-400" />}
        </button>
      )}
    </div>
  );
}

function CommentForm({ entryId, slug }: { entryId: string; slug: string }) {
  const [isPending, start] = useTransition();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    const fd = new FormData();
    fd.set("content", value);
    start(async () => {
      await commentEntry(entryId, fd);
      setValue("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={300}
        placeholder="Skriv en kommentar..."
        className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200"
      />
      <button type="submit" disabled={isPending || !value.trim()}
        className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      </button>
    </form>
  );
}
