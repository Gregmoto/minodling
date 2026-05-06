export const revalidate = 86400;

import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Clock, HelpCircle, ShoppingBag, Users } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getNavUser } from "@/lib/nav-user";
import { canonicalUrl, baseOg } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const url = canonicalUrl(settings, "/kontakt");
  return {
    title: "Kontakta oss – Minodling",
    description:
      "Har du frågor om Minodling? Kontakta oss via formuläret eller e-post. Vi svarar normalt inom 1–2 arbetsdagar.",
    alternates: { canonical: url },
    openGraph: {
      ...baseOg(settings),
      title: "Kontakta oss – Minodling",
      description: "Vi hjälper dig gärna – hör av dig!",
      url,
    },
  };
}

const QUICK_LINKS = [
  {
    icon: HelpCircle,
    title: "Vanliga frågor",
    description: "Svar på de vanligaste frågorna om Minodling, kontot och butiken.",
    href: "/fragor",
    color: "blue",
  },
  {
    icon: ShoppingBag,
    title: "Orderfrågor",
    description: "Frågor om en beställning, retur eller leverans? Ange ditt ordernummer.",
    href: "/butik",
    color: "amber",
  },
  {
    icon: Users,
    title: "Community",
    description: "Odlingsfrågor? Ställ dem i forumet och få svar från andra odlare.",
    href: "/forum",
    color: "green",
  },
];

const COLORS: Record<string, string> = {
  blue:  "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-green-50 text-green-600",
};

export default async function KontaktPage() {
  const user    = await getCurrentUser();
  const navUser = await getNavUser(user?.id);
  const settings = await getSettings();
  const contactEmail = settings.contactEmail || "hej@minodling.se";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-white">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-sage-50 to-green-50 border-b border-gray-100 py-14">
          <div className="container-main max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Kontakt</p>
                <h1 className="text-3xl font-bold text-gray-900">Hur kan vi hjälpa dig?</h1>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
              Vi finns här för dig! Fyll i formuläret eller skicka ett e-post direkt.
              Vi svarar normalt inom <strong>1–2 arbetsdagar</strong>.
            </p>
          </div>
        </section>

        {/* ── QUICK LINKS ────────────────────────────────────── */}
        <section className="py-12 border-b border-gray-100">
          <div className="container-main">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">
              Kanske hittar du svaret snabbare här?
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group flex gap-4 p-4 rounded-2xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${COLORS[link.color]}`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors text-sm">
                      {link.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORM + INFO ─────────────────────────────────────── */}
        <section className="py-16">
          <div className="container-main">
            <div className="grid md:grid-cols-5 gap-12">

              {/* Form */}
              <div className="md:col-span-3">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Skicka ett meddelande</h2>
                <ContactForm />
              </div>

              {/* Sidebar info */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-sage-50 rounded-2xl p-6 border border-sage-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5 text-sage-600" />
                    <h3 className="font-semibold text-gray-900">E-post</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Föredrar du att maila direkt?
                  </p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-green-700 font-medium text-sm hover:underline break-all"
                  >
                    {contactEmail}
                  </a>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Svarstider</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between">
                      <span>Måndag–fredag</span>
                      <span className="font-medium text-gray-800">Inom 1 arbetsdag</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Helger</span>
                      <span className="font-medium text-gray-800">Måndag</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <p className="text-sm font-semibold text-amber-800 mb-1">💡 Tips!</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Har du en odlingsfråga? Du får snabbare svar i vårt{" "}
                    <Link href="/forum" className="underline hover:text-amber-900">forum</Link>
                    {" "}eller{" "}
                    <Link href="/fragor" className="underline hover:text-amber-900">Frågor & svar</Link>
                    {" "}– där finns tusentals erfarna odlare som hjälper till!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
