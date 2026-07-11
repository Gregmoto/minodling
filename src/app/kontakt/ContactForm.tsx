"use client";

import { useState, useTransition } from "react";
import { Send, Check, AlertCircle } from "lucide-react";
import { sendContactForm } from "./actions";

const ic = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 bg-white transition-colors";
const lc = "block text-sm font-medium text-gray-700 mb-1.5";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await sendContactForm(fd);
      if (result.success) {
        setSuccess(true);
        form.reset();
      } else {
        setError(result.error ?? "Något gick fel, försök igen.");
      }
    });
  }

  if (success) {
    return (
      <div className="text-center py-12 px-6 bg-green-50 border border-green-200 rounded-2xl">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Meddelande skickat!</h3>
        <p className="text-gray-600">
          Tack för att du hör av dig. Vi svarar normalt inom 1–2 arbetsdagar.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-medium text-green-700 hover:underline"
        >
          Skicka ett till
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className={lc}>Namn *</label>
          <input id="contact-name" name="name" required placeholder="Ditt namn" className={ic} />
        </div>
        <div>
          <label htmlFor="contact-email" className={lc}>E-post *</label>
          <input id="contact-email" name="email" type="email" required placeholder="din@epost.se" className={ic} />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className={lc}>Ämne</label>
        <input id="contact-subject" name="subject" placeholder="Vad gäller ditt ärende?" className={ic} />
      </div>

      <div>
        <label htmlFor="contact-message" className={lc}>Meddelande *</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Beskriv ditt ärende…"
          className={`${ic} resize-y`}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors"
      >
        {pending
          ? <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
          : <Send className="h-4 w-4" />}
        {pending ? "Skickar…" : "Skicka meddelande"}
      </button>
    </form>
  );
}
