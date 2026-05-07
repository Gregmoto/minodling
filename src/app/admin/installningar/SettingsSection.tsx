"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

// ── Submit-knapp med pending-state ────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-60 transition-colors"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? "Sparar…" : "Spara ändringar"}
    </button>
  );
}

// ── Wrapper-komponent ─────────────────────────────────────────────

type ActionFn = (
  prev: { ok: boolean } | null,
  fd: FormData,
) => Promise<{ ok: boolean }>;

export function SettingsSection({
  action,
  children,
}: {
  action: ActionFn;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {children}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {state?.ok ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Inställningarna sparades
          </span>
        ) : (
          <span />
        )}
        <SubmitButton />
      </div>
    </form>
  );
}
