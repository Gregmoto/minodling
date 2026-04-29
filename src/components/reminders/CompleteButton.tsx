"use client";

import { useTransition } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { completeReminder, uncompleteReminder } from "@/app/paminnelser/actions";

interface Props {
  reminderId:  string;
  isCompleted: boolean;
}

export function CompleteButton({ reminderId, isCompleted }: Props) {
  const [isPending, start] = useTransition();

  function handleClick() {
    start(() =>
      isCompleted
        ? uncompleteReminder(reminderId)
        : completeReminder(reminderId)
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isCompleted ? "Återöppna" : "Markera som klar"}
      className={`flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all disabled:opacity-50 shrink-0 ${
        isCompleted
          ? "bg-green-500 border-green-500 text-white hover:bg-red-400 hover:border-red-400"
          : "border-gray-300 bg-white hover:border-green-500 hover:bg-green-50"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isCompleted ? (
        <Check className="h-3.5 w-3.5" />
      ) : null}
    </button>
  );
}
