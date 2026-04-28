"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}

export function DeleteButton({ action, label = "Radera", confirmText = "Är du säker på att du vill radera detta?" }: DeleteButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmText)) return;
    startTransition(() => action());
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-3 w-3" />
      {pending ? "Raderar..." : label}
    </button>
  );
}
