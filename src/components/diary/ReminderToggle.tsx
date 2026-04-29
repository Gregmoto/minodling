"use client";

import { useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toggleReminder, deleteReminder } from "@/app/dagbok/actions";

interface Props {
  reminderId:  string;
  diaryId:     string;
  isCompleted: boolean;
}

export function ReminderToggle({ reminderId, diaryId, isCompleted }: Props) {
  const [togglePending, startToggle] = useTransition();
  const [deletePending, startDelete] = useTransition();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => startToggle(() => toggleReminder(reminderId, diaryId))}
        disabled={togglePending}
        title={isCompleted ? "Markera som ej klar" : "Markera som klar"}
        className={`flex items-center justify-center h-5 w-5 rounded border transition-colors disabled:opacity-50 ${
          isCompleted
            ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
            : "border-gray-300 bg-white hover:border-green-500 hover:bg-green-50"
        }`}
      >
        {togglePending
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : isCompleted
          ? <Check className="h-3 w-3" />
          : null}
      </button>
      <button
        onClick={() => startDelete(() => deleteReminder(reminderId, diaryId))}
        disabled={deletePending}
        title="Ta bort"
        className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        {deletePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
