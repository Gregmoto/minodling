"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateReviewStatus, deleteReview, replyToReview } from "@/app/admin/butik/actions";

interface Props {
  reviewId: string;
  currentStatus: string;
  currentReply: string | null;
}

export function ReviewActions({ reviewId, currentStatus, currentReply }: Props) {
  const [pending, startTransition] = useTransition();
  const [reply, setReply] = useState(currentReply ?? "");
  const [replySaved, setReplySaved] = useState(false);
  const router = useRouter();

  function handleStatus(status: string) {
    startTransition(async () => {
      await updateReviewStatus(reviewId, status);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Är du säker på att du vill radera detta omdöme?")) return;
    startTransition(async () => {
      await deleteReview(reviewId);
      router.push("/admin/butik/omdomen");
    });
  }

  function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await replyToReview(reviewId, reply);
      setReplySaved(true);
      router.refresh();
    });
  }

  const btnBase =
    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50";

  return (
    <div className="space-y-6">
      {/* Status actions */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Ändra status</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatus("approved")}
            disabled={pending || currentStatus === "approved"}
            className={`${btnBase} bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300`}
          >
            Godkänn
          </button>
          <button
            onClick={() => handleStatus("rejected")}
            disabled={pending || currentStatus === "rejected"}
            className={`${btnBase} bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300`}
          >
            Neka
          </button>
          <button
            onClick={() => handleStatus("hidden")}
            disabled={pending || currentStatus === "hidden"}
            className={`${btnBase} bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300`}
          >
            Dölj
          </button>
          <button
            onClick={() => handleStatus("pending")}
            disabled={pending || currentStatus === "pending"}
            className={`${btnBase} bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-300`}
          >
            Återställ till Väntar
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className={`${btnBase} border border-red-300 text-red-700 hover:bg-red-50`}
          >
            Radera permanent
          </button>
        </div>
      </div>

      {/* Admin reply */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Svar från butiken</p>
        <form onSubmit={handleReply} className="space-y-2">
          <textarea
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              setReplySaved(false);
            }}
            rows={4}
            placeholder="Skriv ett svar till kunden (lämna tomt för att ta bort)…"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {pending ? "Sparar…" : "Spara svar"}
            </button>
            {replySaved && (
              <span className="text-sm text-green-600 font-medium">Sparat!</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
