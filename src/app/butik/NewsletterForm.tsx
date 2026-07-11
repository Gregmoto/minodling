"use client";

import { useState } from "react";
import { subscribeNewsletter } from "./actions";
import { Mail, Check } from "lucide-react";

interface Props {
  variant?: "light" | "dark";
}

export function NewsletterForm({ variant = "light" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const result = await subscribeNewsletter(email);
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
      <div className={`flex items-center gap-3 justify-center rounded-2xl px-6 py-4 ${
        variant === "dark"
          ? "bg-white/10 text-white border border-white/20"
          : "bg-green-50 text-green-700 border border-green-200"
      }`}>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          variant === "dark" ? "bg-white/20" : "bg-green-100"
        }`}>
          <Check className="h-4 w-4" />
        </div>
        <p className="font-medium">Tack! Du är nu prenumerant 🌱</p>
      </div>
    );
  }

  const isDark = variant === "dark";

  return (
    <form onSubmit={handleSubmit}>
      <div className={`flex gap-2 rounded-2xl p-1.5 ${
        isDark ? "bg-white/10 border border-white/20" : "bg-white border border-sage-200 shadow-sm"
      }`}>
        <div className="relative flex-1 flex items-center">
          <Mail className={`absolute left-3 h-4 w-4 pointer-events-none ${isDark ? "text-white/50" : "text-gray-400"}`} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.se"
            aria-label="E-postadress"
            required
            className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-transparent focus:outline-none ${
              isDark
                ? "text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/30"
                : "text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/20"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap ${
            isDark
              ? "bg-green-500 hover:bg-green-400 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {status === "loading" ? "…" : "Prenumerera"}
        </button>
      </div>
      {status === "error" && (
        <p className={`text-sm mt-2 text-center ${isDark ? "text-red-300" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
