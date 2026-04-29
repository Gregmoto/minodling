import Link from "next/link";
import { Sprout, Instagram, Facebook } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { CookieSettingsButton } from "@/components/cookies/CookieSettingsButton";

const footerLinks = {
  community: [
    { label: "Forum",           href: "/forum" },
    { label: "Odlingstips",     href: "/odlingstips" },
    { label: "Min odling",      href: "/min-odling" },
    { label: "Senaste inlägg",  href: "/forum?sort=new" },
  ],
  information: [
    { label: "Om Minodling",  href: "/om-oss" },
    { label: "Kontakt",       href: "/kontakt" },
    { label: "Nyhetsbrev",    href: "/nyhetsbrev" },
    { label: "Premium",       href: "/premium" },
  ],
  legal: [
    { label: "Integritetspolicy", href: "/integritetspolicy" },
    { label: "Användarvillkor",   href: "/anvandarvillkor" },
    { label: "Cookies",           href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-sage-100 bg-cream-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Varumärke */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-gray-900">
                min<span className="text-green-600">odling</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Sveriges community för alla som älskar att odla. Dela kunskap, inspiration och
              trädgårdsglädje.
            </p>
            <div className="flex gap-3">
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-sage-200 text-gray-500 hover:text-green-600 hover:border-green-300 transition-colors"
                aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-sage-200 text-gray-500 hover:text-green-600 hover:border-green-300 transition-colors"
                aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-green-700 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Information</h3>
            <ul className="space-y-3">
              {footerLinks.information.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-green-700 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legalt */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legalt</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-green-700 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sage-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Minodling. Alla rättigheter förbehållna.
          </p>
          <p className="text-xs text-gray-400">
            Byggt med kärlek för svenska odlare 🌱
          </p>
        </div>
      </div>
    </footer>
  );
}
