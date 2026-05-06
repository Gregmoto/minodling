"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, Sprout, Bell, ChevronDown,
  LayoutDashboard, BookOpen, AlarmClock,
  User, Settings, ShieldCheck, LogOut, Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { Avatar } from "@/components/ui/Avatar";

interface NavbarProps {
  user?: {
    id:           string;
    username:     string;
    displayName?: string | null;
    avatarUrl?:   string | null;
    role?:        string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const profileItems = [
    { label: "Dashboard",     href: "/dashboard",                icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Odlingsdagbok", href: "/dagbok",                   icon: <BookOpen        className="h-4 w-4" /> },
    { label: "Påminnelser",   href: "/paminnelser",              icon: <AlarmClock      className="h-4 w-4" /> },
    { label: "Min profil",    href: `/profil/${user?.username}`, icon: <User            className="h-4 w-4" /> },
    { label: "Inställningar", href: "/installningar",            icon: <Settings        className="h-4 w-4" /> },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group mr-2"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-600 text-white group-hover:bg-green-700 transition-colors">
              <Sprout className="h-4.5 w-4.5" />
            </div>
            <span className="hidden sm:block font-bold text-[16px] text-gray-900 tracking-tight">
              min<span className="text-green-600">odling</span>
            </span>
          </Link>

          {/* ── Desktop nav – alla länkar direkt ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 overflow-x-auto">
            {siteConfig.navPrimary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
                  isActive(item.href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── Spacer ── */}
          <div className="flex-1 lg:flex-none" />

          {/* ── Höger sida ── */}
          <div className="flex items-center gap-1">

            {user ? (
              <>
                {/* Påminnelser */}
                <Link
                  href="/paminnelser"
                  className="relative h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  aria-label="Påminnelser"
                >
                  <Bell className="h-4 w-4" />
                </Link>

                {/* Profil-dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      fallback={user.displayName ?? user.username}
                      size="sm"
                    />
                    <ChevronDown className={cn(
                      "h-3 w-3 text-gray-400 transition-transform duration-150 hidden sm:block",
                      profileOpen && "rotate-180",
                    )} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 bg-white shadow-xl z-20 overflow-hidden">
                        <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-green-100/50 border-b border-green-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.displayName ?? user.username}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">@{user.username}</p>
                        </div>
                        <div className="py-1.5">
                          {profileItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-gray-400">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        {(user.role === "admin" || user.role === "moderator") && (
                          <>
                            <div className="border-t border-gray-100" />
                            <div className="py-1.5">
                              {user.role === "admin" && (
                                <Link href="/admin" onClick={() => setProfileOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors">
                                  <ShieldCheck className="h-4 w-4" /> Adminpanel
                                </Link>
                              )}
                              <Link href="/moderator" onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors">
                                <Leaf className="h-4 w-4" /> Moderatorpanel
                              </Link>
                            </div>
                          </>
                        )}
                        <div className="border-t border-gray-100" />
                        <div className="py-1.5">
                          <form action="/auth/logout" method="post">
                            <button type="submit"
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <LogOut className="h-4 w-4" /> Logga ut
                            </button>
                          </form>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login"
                  className="hidden sm:block px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors whitespace-nowrap">
                  Logga in
                </Link>
                <Link href="/auth/register"
                  className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm">
                  Gå med
                </Link>
              </>
            )}

            {/* Mobil-hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 transition-colors ml-1"
              aria-label="Meny"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobil-meny ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-0.5">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {!user ? (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-center text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                Logga in
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-center text-white bg-green-600 hover:bg-green-700 transition-colors">
                Gå med
              </Link>
            </div>
          ) : (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-0.5">
              {profileItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-400">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <form action="/auth/logout" method="post">
                <button type="submit"
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" /> Logga ut
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
