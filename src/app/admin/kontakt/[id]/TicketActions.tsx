"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Check, Loader2 } from "lucide-react";
import { replyToTicket, updateTicketStatus, deleteTicket } from "@/app/kontakt/actions";

const ic = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white";

export function TicketReplyForm({ ticketId, hasReply }: { ticketId: string; hasReply: boolean }) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [reply, setReply] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await replyToTicket(ticketId, fd);
      setSent(true);
      setReply("");
      router.refresh();
    });
  }

  if (sent || hasReply) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 font-medium py-2">
        <Check className="h-4 w-4" />
        Svar har skickats till kunden
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        name="reply"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={6}
        required
        placeholder="Skriv ditt svar här…"
        className={`${ic} resize-y`}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !reply.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {pending ? "Skickar…" : "Skicka svar via e-post"}
        </button>
        <p className="text-xs text-gray-400">Kunden får ett e-postmeddelande och ärendet stängs.</p>
      </div>
    </form>
  );
}

export function TicketStatusSelect({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const status = fd.get("status") as string;
    startTransition(async () => {
      await updateTicketStatus(ticketId, status, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setNote("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleChange} className="space-y-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
      >
        <option value="open">Öppen</option>
        <option value="in_progress">Pågår</option>
        <option value="closed">Stängd</option>
      </select>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Intern anteckning (valfri)"
        className={ic}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2 bg-sage-600 text-white text-sm font-semibold rounded-xl hover:bg-sage-700 disabled:opacity-60 transition-colors"
      >
        {pending ? "Sparar…" : saved ? "✓ Sparat" : "Uppdatera status"}
      </button>
    </form>
  );
}

export function TicketDeleteButton({ ticketId }: { ticketId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Är du säker på att du vill radera detta ärende?")) return;
    startTransition(async () => {
      await deleteTicket(ticketId);
      router.push("/admin/kontakt");
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="w-full px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-60 transition-colors"
    >
      {pending ? "Raderar…" : "Radera ärende"}
    </button>
  );
}
