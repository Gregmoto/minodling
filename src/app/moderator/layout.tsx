import Link from "next/link";
import { Shield, FileText, Flag, Users, Sprout, ChevronRight } from "lucide-react";
import { requireModerator } from "@/lib/auth";
import { cn } from "@/lib/utils";

const modNav = [
  { label: "Översikt",  href: "/moderator",          icon: Shield,   exact: true },
  { label: "Inlägg",    href: "/moderator/inlagg",   icon: FileText },
  { label: "Rapporter", href: "/moderator/rapporter", icon: Flag },
  { label: "Användare", href: "/moderator/anvandare", icon: Users },
];

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireModerator();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-sage-100 fixed h-full">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sage-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">minodling</div>
            <div className="text-xs text-gray-400">Moderatorpanel</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {modNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  "text-gray-600 hover:bg-sage-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                <ChevronRight className="h-3 w-3 ml-auto text-gray-300" />
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-sage-100 space-y-2">
          {profile.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 text-xs text-green-700 hover:text-green-800 transition-colors"
            >
              <Sprout className="h-3 w-3" />
              Adminpanel
            </Link>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-green-700 transition-colors"
          >
            ← Tillbaka till sajten
          </Link>
        </div>
      </aside>

      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-sage-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="text-sm text-gray-500">
            Inloggad som{" "}
            <span className="font-medium text-gray-900">@{profile.username}</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {profile.role === "admin" ? "Admin" : "Moderator"}
            </span>
          </div>
          <Link href="/" className="text-xs text-gray-500 hover:text-green-700 transition-colors" target="_blank">
            Öppna sajten ↗
          </Link>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
