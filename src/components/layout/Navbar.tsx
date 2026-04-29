"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sprout, Bell, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sage-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logotyp */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white group-hover:bg-green-700 transition-colors">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">
              min<span className="text-green-600">odling</span>
            </span>
          </Link>

          {/* Desktop-navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Höger sida */}
          <div className="flex items-center gap-2">
            {/* Sök */}
            <button
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              aria-label="Sök"
            >
              <Search className="h-4 w-4" />
            </button>

            {user ? (
              <>
                {/* Notifikationer */}
                <button
                  className="relative h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  aria-label="Notifikationer"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500" />
                </button>

                {/* Profilmeny */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      fallback={user.displayName ?? user.username}
                      size="sm"
                    />
                    <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-sage-100 bg-white py-2 shadow-card-hover z-20">
                        <div className="px-4 py-2 border-b border-sage-100 mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.displayName ?? user.username}
                          </p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>

                        {[
                          { label: "Min dashboard",  href: "/dashboard" },
                          { label: "Min odling",     href: "/min-odling" },
                          { label: "Odlingsdagbok",  href: "/dagbok" },
                          { label: "Påminnelser",    href: "/paminnelser" },
                          { label: "Min profil",     href: `/profil/${user.username}` },
                          { label: "Inställningar",  href: "/installningar" },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-sage-50 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}

                        {(user.role === "admin" || user.role === "moderator") && (
                          <>
                            <div className="my-1 border-t border-sage-100" />
                            {user.role === "admin" && (
                              <Link
                                href="/admin"
                                onClick={() => setProfileOpen(false)}
                                className="block px-4 py-2 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors"
                              >
                                Adminpanel
                              </Link>
                            )}
                            <Link
                              href="/moderator"
                              onClick={() => setProfileOpen(false)}
                              className="block px-4 py-2 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors"
                            >
                              Moderatorpanel
                            </Link>
                          </>
                        )}

                        <div className="my-1 border-t border-sage-100" />
                        <form action="/auth/logout" method="post">
                          <button
                            type="submit"
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Logga ut
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Logga in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Gå med</Button>
                </Link>
              </div>
            )}

            {/* Mobil-meny-knapp */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
              aria-label="Meny"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil-meny */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sage-100 bg-white px-4 py-4 space-y-1">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {item.label}
            </Link>
          ))}

          {!user && (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Logga in
                </Button>
              </Link>
              <Link href="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">
                  Gå med
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
