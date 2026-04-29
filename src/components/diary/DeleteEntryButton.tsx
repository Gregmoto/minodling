"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteDiaryEntry } from "@/app/dagbok/actions";

interface Props {
  entryId: string;
  diaryId: string;
}

export function DeleteEntryButton({ entryId, diaryId }: Props) {
  const [isPending, start] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Ta bort den här händelsen?")) return;
        start(() => deleteDiaryEntry(entryId, diaryId));
      }}
      disabled={isPending}
      className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
      title="Ta bort"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
