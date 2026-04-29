"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { toggleFollow } from "@/app/forum/actions";

interface FollowButtonProps {
  targetProfileId: string;
  initialFollowing: boolean;
  size?: "sm" | "md";
}

export function FollowButton({ targetProfileId, initialFollowing, size = "sm" }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(targetProfileId);
      setFollowing(result.following);
    });
  }

  const baseClass = "flex items-center gap-1.5 font-medium rounded-xl transition-colors disabled:opacity-50";
  const sizeClass = size === "sm"
    ? "text-xs px-3 py-1.5"
    : "text-sm px-4 py-2";
  const variantClass = following
    ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
    : "bg-green-600 text-white hover:bg-green-700";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${baseClass} ${sizeClass} ${variantClass}`}
    >
      {following ? (
        <>
          <UserCheck className="h-3.5 w-3.5" />
          Följer
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Följ
        </>
      )}
    </button>
  );
}
