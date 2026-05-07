import Link from "next/link";
import { Sprout } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSearch } from "@/components/admin/AdminSearch";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 fixed h-full z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white shrink-0">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">minodling</div>
            <div className="text-[10px] text-gray-400 leading-tight">Adminpanel</div>
          </div>
        </div>

        {/* Nav */}
        <AdminNav />

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 shrink-0">
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-green-700 transition-colors">
            ← Tillbaka till sajten
          </Link>
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobil: logo */}
            <div className="lg:hidden flex items-center gap-2 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white">
                <Sprout className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="hidden sm:block text-sm text-gray-500 shrink-0">
              Inloggad som{" "}
              <span className="font-semibold text-gray-900">@{profile.username}</span>
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Admin
              </span>
            </div>
          </div>

          {/* Sökning */}
          <AdminSearch />

          <Link
            href="/"
            target="_blank"
            className="text-xs text-gray-400 hover:text-green-700 transition-colors shrink-0"
          >
            Öppna sajten ↗
          </Link>
        </header>

        {/* Sidinnehåll */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
