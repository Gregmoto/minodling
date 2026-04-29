"use client";

import { useTransition } from "react";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { joinChallenge, leaveChallenge } from "@/app/utmaningar/actions";

export function JoinChallengeButton({
  challengeId,
  isParticipant,
}: {
  challengeId: string;
  isParticipant: boolean;
}) {
  const [isPending, start] = useTransition();

  function toggle() {
    start(async () => {
      if (isParticipant) await leaveChallenge(challengeId);
      else               await joinChallenge(challengeId);
    });
  }

  if (isParticipant) {
    return (
      <button onClick={toggle} disabled={isPending}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
        Lämna utmaning
      </button>
    );
  }

  return (
    <button onClick={toggle} disabled={isPending}
      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      Gå med i utmaningen
    </button>
  );
}
