import Link from "next/link";
import { Sprout } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white group-hover:bg-green-700 transition-colors">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-gray-900">
            min<span className="text-green-600">odling</span>
          </span>
        </Link>
      </header>

      {/* Innehåll */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        © {new Date().getFullYear()} Minodling ·{" "}
        <Link href="/integritetspolicy" className="hover:text-green-700 transition-colors">
          Integritetspolicy
        </Link>{" "}
        ·{" "}
        <Link href="/anvandarvillkor" className="hover:text-green-700 transition-colors">
          Användarvillkor
        </Link>
      </footer>
    </div>
  );
}
