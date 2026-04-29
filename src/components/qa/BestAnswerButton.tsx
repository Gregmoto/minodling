"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { markBestAnswer } from "@/app/fragor/actions";

interface Props {
  questionId: string;
  answerId:   string;
  isBest:     boolean;
}

export function BestAnswerButton({ questionId, answerId, isBest }: Props) {
  const [isPending, start] = useTransition();

  function handleClick() {
    start(async () => {
      await markBestAnswer(questionId, answerId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 ${
        isBest
          ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
      }`}
      title={isBest ? "Avmarkera som bästa svar" : "Markera som bästa svar"}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      {isBest ? "Bästa svar ✓" : "Markera som bäst"}
    </button>
  );
}
