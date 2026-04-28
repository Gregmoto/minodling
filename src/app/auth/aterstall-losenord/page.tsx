"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Ange din e-postadress.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/uppdatera-losenord`,
    });

    setLoading(false);

    if (resetError) {
      setError("Något gick fel. Försök igen.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <Card className="text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
          Mejl skickat!
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Kolla din e-post för en länk för att återställa ditt lösenord.
          Mejlet kan ta 1–2 minuter.
        </p>
        <Link
          href="/auth/login"
          className="inline-block mt-6 text-sm text-green-700 hover:text-green-800 font-medium transition-colors"
        >
          ← Tillbaka till inloggning
        </Link>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Glömt lösenordet?
        </h1>
        <p className="text-gray-500">
          Ange din e-postadress så skickar vi en återställningslänk.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="E-postadress"
            type="email"
            placeholder="din@epost.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Skicka återställningslänk
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-gray-500 mt-6">
        Kom du ihåg lösenordet?{" "}
        <Link href="/auth/login" className="text-green-700 font-medium hover:text-green-800 transition-colors">
          Logga in
        </Link>
      </p>
    </div>
  );
}
