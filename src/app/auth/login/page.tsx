"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  // Tillåt bara interna sökvägar – skydda mot open redirect till externa domäner.
  const redirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setServerError("Felaktig e-postadress eller lösenord.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Input
          label="E-postadress"
          type="email"
          placeholder="din@epost.se"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />

        <div>
          <Input
            label="Lösenord"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/auth/aterstall-losenord"
              className="text-xs text-green-700 hover:text-green-800 transition-colors"
            >
              Glömt lösenordet?
            </Link>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2">
          Logga in
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Välkommen tillbaka
        </h1>
        <p className="text-gray-500">Logga in för att fortsätta till din odling</p>
      </div>

      <Suspense fallback={<Card><div className="h-48 animate-pulse bg-sage-50 rounded-xl" /></Card>}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-gray-500 mt-6">
        Inget konto?{" "}
        <Link href="/auth/register" className="text-green-700 font-medium hover:text-green-800 transition-colors">
          Skapa ett gratis konto
        </Link>
      </p>
    </div>
  );
}
