"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteReminder } from "@/app/paminnelser/actions";

export function DeleteReminderButton({ reminderId }: { reminderId: string }) {
  const [isPending, start] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Ta bort påminnelsen?")) return;
        start(() => deleteReminder(reminderId));
      }}
      disabled={isPending}
      title="Ta bort"
      className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
