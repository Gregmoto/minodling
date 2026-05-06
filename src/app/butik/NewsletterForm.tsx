"use client";
import { useState } from "react";
import { subscribeNewsletter } from "./actions";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const result = await subscribeNewsletter(email, firstName);
      if (result.success) {
        setStatus("success");
        setMessage("Tack! Du är nu prenumerant.");
        setEmail("");
        setFirstName("");
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
      <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 text-green-700 font-medium">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Förnamn (valfritt)"
          className="flex-1 px-3 py-2.5 rounded-xl border border-sage-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Din e-post"
          required
          className="flex-1 px-3 py-2.5 rounded-xl border border-sage-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
      >
        {status === "loading" ? "Prenumererar..." : "Prenumerera"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600 text-center">{message}</p>
      )}
    </form>
  );
}
