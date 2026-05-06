import type { Metadata } from "next";
import { Mail, Leaf, ShoppingBag, BookOpen, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNavUser } from "@/lib/nav-user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignupForm } from "./NewsletterSignupForm";

export const metadata: Metadata = {
  title: "Nyhetsbrev – Minodling",
  description:
    "Prenumerera på Minodlings nyhetsbrev och få odlingstips, nyheter från butiken och säsongsråd direkt i din inkorg.",
};

const BENEFITS = [
  {
    icon: Leaf,
    title: "Odlingstips & säsongsråd",
    desc: "Veckans bästa tips anpassade efter säsong – vad du bör så, plantera och skörda just nu.",
  },
  {
    icon: ShoppingBag,
    title: "Nyheter från butiken",
    desc: "Få reda på nya produkter, kampanjer och exklusiva erbjudanden för prenumeranter.",
  },
  {
    icon: BookOpen,
    title: "Guider och inspiration",
    desc: "Djupare artiklar och guider om odling, kompost, växtskydd och mer.",
  },
  {
    icon: Bell,
    title: "Community-höjdpunkter",
    desc: "De bästa frågorna och inläggen från communityn – håll dig uppdaterad.",
  },
];

export default async function NyhetsbrevPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const navUser = await getNavUser(user?.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-green-700 to-green-900 overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-green-500/20 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-green-400/10 blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium text-green-100 mb-6">
              <Mail className="h-4 w-4" />
              Gratis nyhetsbrev
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Odlingstips direkt i din inkorg
            </h1>
            <p className="text-lg text-green-100 mb-10 leading-relaxed">
              Prenumerera gratis och få säsongsanpassade tips, nyheter från butiken och inspiration från odlingscommunity varje vecka.
            </p>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <NewsletterSignupForm source="nyhetsbrev" />
              <p className="text-xs text-green-200 mt-4">
                Inga spam. Avprenumerera när du vill. Vi delar aldrig dina uppgifter.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-20 bg-cream-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
              Vad ingår i nyhetsbrevet?
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-lg mx-auto">
              Vi skickar nyhetsbrev 1–2 gånger per månad med relevant innehåll för alla odlingsnivåer.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="bg-white rounded-2xl border border-sage-100 p-6 flex gap-4 shadow-sm">
                    <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-white border-t border-sage-100">
          <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Redo att börja?</h2>
            <p className="text-gray-600 mb-8">
              Gå med tusentals odlingsentusiaster som redan prenumererar.
            </p>
            <NewsletterSignupForm source="nyhetsbrev" />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
