"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/app/butik/actions";
import { Mail, Check, Loader2 } from "lucide-react";

interface Props {
  source?: string;
}

export function NewsletterSignupForm({ source = "nyhetsbrev" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const result = await subscribeNewsletter(email, source);
      if (result.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.error ?? "Något gick fel, försök igen.");
      }
    } catch {
      setStatus("error");
      setMessage("Något gick fel, försök igen.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">Du är nu prenumerant!</p>
          <p className="text-gray-600 mt-1">Välkommen till Minodlings nyhetsbrev 🌱</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.se"
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Registrerar…</>
          ) : "Prenumerera gratis"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600 mt-2 text-center">{message}</p>
      )}
    </form>
  );
}
