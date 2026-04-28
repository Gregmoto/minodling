"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const result = registerSchema.safeParse(form);
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

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          display_name: form.displayName || form.username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setServerError("Den e-postadressen är redan registrerad.");
      } else {
        setServerError("Något gick fel. Försök igen.");
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Card className="text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
          Kolla din e-post!
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Vi har skickat en bekräftelsemejl till{" "}
          <strong className="text-gray-700">{form.email}</strong>. Klicka på
          länken i mejlet för att aktivera ditt konto.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Mejlet kan ta 1–2 minuter. Kolla skräpposten om det dröjer.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Skapa konto
        </h1>
        <p className="text-gray-500">
          Gratis för alltid – gå med på 30 sekunder
        </p>
      </div>

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
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />

          <Input
            label="Användarnamn"
            type="text"
            placeholder="odlarglad"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            error={errors.username}
            hint="Syns i forumet. Bara bokstäver, siffror, _ och -"
            autoComplete="username"
            required
          />

          <Input
            label="Visningsnamn (valfritt)"
            type="text"
            placeholder="Anna Svensson"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            error={errors.displayName}
          />

          <Input
            label="Lösenord"
            type="password"
            placeholder="Minst 8 tecken"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            required
          />

          <p className="text-xs text-gray-400">
            Genom att registrera dig godkänner du våra{" "}
            <Link href="/anvandarvillkor" className="text-green-700 hover:underline">
              användarvillkor
            </Link>{" "}
            och{" "}
            <Link href="/integritetspolicy" className="text-green-700 hover:underline">
              integritetspolicy
            </Link>
            .
          </p>

          <Button type="submit" loading={loading} className="w-full">
            Skapa konto
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-gray-500 mt-6">
        Har du redan ett konto?{" "}
        <Link href="/auth/login" className="text-green-700 font-medium hover:text-green-800 transition-colors">
          Logga in
        </Link>
      </p>
    </div>
  );
}
