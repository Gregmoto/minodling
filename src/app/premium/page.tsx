import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Check, Sparkles, ArrowRight, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PREMIUM_FEATURES, PLANS } from "./constants";

export const metadata: Metadata = {
  title: "Minodling Premium – Odla smartare",
  description: "Få tillgång till personlig odlingsplan, digital trädgårdsplanerare, expertchatt och mycket mer. Kommer snart.",
};

export default async function PremiumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  }) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-white">

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-100">
          {/* Dekorativa cirklar */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-orange-200/20 blur-3xl pointer-events-none" />

          <div className="container-main py-20 relative">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Kommer snart
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Odla smartare med{" "}
                <span className="text-amber-600">Minodling Premium</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Vi bygger premium-funktioner som hjälper dig planera, lära och odla bättre.
                Anmäl intresse så meddelar vi dig när det öppnar.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="mailto:info@minodling.se?subject=Intresseanmälan Premium"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors shadow-sm">
                  <Crown className="h-4 w-4" />
                  Anmäl intresse
                  <ArrowRight className="h-4 w-4" />
                </a>
                {!user && (
                  <Link href="/registrera"
                    className="inline-flex items-center gap-2 px-6 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    Skapa konto gratis
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Funktioner */}
        <div className="container-main py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Vad ingår i Premium?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Alla funktioner nedan är under uppbyggnad. Prenumeranter får tillgång när de lanseras.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PREMIUM_FEATURES.map((feature) => (
              <div key={feature.key}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group overflow-hidden">
                {/* Coming soon overlay badge */}
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                    <Lock className="h-2.5 w-2.5" />
                    Snart
                  </span>
                </div>

                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5 pr-14">{feature.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prissättning */}
        <div className="bg-gray-50 border-t border-gray-100 py-20">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Planerat pris</h2>
              <p className="text-gray-500">Priserna är preliminära och kan ändras innan lansering.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {PLANS.map((plan) => (
                <div key={plan.id}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    plan.highlight
                      ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md"
                      : "border-gray-200 bg-white shadow-sm"
                  }`}>
                  {"badge" in plan && plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold text-gray-900">{plan.price} kr</span>
                      <span className="text-sm text-gray-500">/{plan.interval === "month" ? "mån" : "år"}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <button disabled
                      className="w-full py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      Öppnar snart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-400 mt-8">
              Betalning via Stripe · Avsluta när som helst · Inga bindningstider
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="container-main py-16">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Vanliga frågor</h2>
          <div className="max-w-xl mx-auto space-y-5">
            {[
              {
                q: "När lanseras Premium?",
                a: "Vi bygger funktionerna nu och siktar på lansering under 2025. Anmäl intresse så får du ett mail direkt när det öppnar.",
              },
              {
                q: "Kostar det något att anmäla intresse?",
                a: "Nej, det är helt gratis. Du förbinder dig till ingenting.",
              },
              {
                q: "Vad händer med mitt gratis-konto?",
                a: "Det gratis-kontot finns alltid kvar. Premium är ett tillval för dig som vill ha mer.",
              },
              {
                q: "Hur betalas Premium?",
                a: "Via Stripe med kort eller Swish. Du kan avsluta prenumerationen när som helst utan bindningstid.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-5">
                <p className="font-medium text-gray-900 mb-1.5">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
