"use client";

import { useTransition } from "react";
import { EyeOff, Loader2 } from "lucide-react";

interface Props {
  action: () => Promise<void>;
  label?: string;
}

export function HideContentButton({ action, label = "Dölj" }: Props) {
  const [isPending, start] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Vill du dölja detta innehåll?")) return;
        start(() => action());
      }}
      disabled={isPending}
      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <EyeOff className="h-3 w-3" />}
      {isPending ? "..." : label}
    </button>
  );
}
