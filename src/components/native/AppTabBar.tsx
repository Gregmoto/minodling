"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Leaf, Camera, Sprout, Menu } from "lucide-react";
import { isNative } from "@/lib/native";

/**
 * Flikfält i botten – visas bara inne i appen, aldrig på webben.
 *
 * Det är det här som gör att appen känns som en app och inte som en
 * webbsida i en ruta. Fem flikar täcker appens huvudflöden; resten av
 * sajten nås via "Mer".
 */

const TABS = [
  { href: "/",                  label: "Hem",         icon: Home },
  { href: "/vaxtdatabas",       label: "Växter",      icon: Leaf },
  { href: "/vaxtidentifiering", label: "Identifiera", icon: Camera, accent: true },
  { href: "/min-odling",        label: "Min odling",  icon: Sprout },
  { href: "/meny",              label: "Mer",         icon: Menu },
] as const;

export function AppTabBar() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  // isNative() läser window – får bara köras efter montering, annars
  // skiljer sig serverns HTML från klientens.
  useEffect(() => setShow(isNative()), []);
  if (!show) return null;

  function active(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      aria-label="Appnavigering"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sage-200 bg-cream-50/95 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon, ...rest }) => {
          const isActive = active(href);
          const accent = "accent" in rest && rest.accent;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-col items-center gap-1 px-1 pt-2 pb-1.5"
              >
                {accent ? (
                  // Kameran lyfts fram – det är appens tydligaste nyttovärde.
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      isActive ? "bg-green-800" : "bg-green-700"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                  </span>
                ) : (
                  <Icon
                    className={`h-6 w-6 transition-colors ${
                      isActive ? "text-green-700" : "text-sage-600"
                    }`}
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                )}
                <span
                  className={`text-[10px] leading-none ${
                    isActive ? "font-bold text-green-700" : "font-medium text-sage-600"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
