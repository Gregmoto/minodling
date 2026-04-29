"use client";

import { useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface Props {
  approveAction?: () => Promise<void>;
  rejectAction?:  () => Promise<void>;
  /** Aliases for approveAction / rejectAction */
  onApprove?:    () => Promise<void>;
  onReject?:     () => Promise<void>;
  approveLabel?: string;
  rejectLabel?:  string;
}

export function ApproveRejectButtons({
  approveAction,
  rejectAction,
  onApprove,
  onReject,
  approveLabel = "Godkänn",
  rejectLabel  = "Neka",
}: Props) {
  const [approvePending, startApprove] = useTransition();
  const [rejectPending,  startReject]  = useTransition();

  const handleApprove = approveAction ?? onApprove;
  const handleReject  = rejectAction  ?? onReject;

  return (
    <>
      {handleApprove && approveLabel && (
        <button
          onClick={() => startApprove(() => handleApprove())}
          disabled={approvePending || rejectPending}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
          title={approveLabel}
        >
          {approvePending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {approvePending ? "..." : approveLabel}
        </button>
      )}
      {handleReject && rejectLabel && (
        <button
          onClick={() => startReject(() => handleReject())}
          disabled={approvePending || rejectPending}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          title={rejectLabel}
        >
          {rejectPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          {rejectPending ? "..." : rejectLabel}
        </button>
      )}
    </>
  );
}
