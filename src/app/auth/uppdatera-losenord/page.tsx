"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken.");
      return;
    }
    if (password !== confirm) {
      setError("Lösenorden matchar inte.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Något gick fel. Länken kan ha gått ut.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (done) {
    return (
      <Card className="text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Lösenord uppdaterat!
        </h2>
        <p className="text-gray-500 text-sm">Du skickas nu till din dashboard...</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Nytt lösenord
        </h1>
        <p className="text-gray-500">Välj ett nytt lösenord för ditt konto.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Nytt lösenord"
            type="password"
            placeholder="Minst 8 tecken"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Input
            label="Bekräfta lösenord"
            type="password"
            placeholder="Upprepa lösenordet"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Spara nytt lösenord
          </Button>
        </form>
      </Card>
    </div>
  );
}
