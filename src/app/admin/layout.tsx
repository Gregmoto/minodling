import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Megaphone,
  BarChart3,
  Settings,
  Sprout,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Översikt", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Användare", href: "/admin/anvandare", icon: Users },
  { label: "Inlägg", href: "/admin/inlagg", icon: FileText },
  { label: "Kategorier", href: "/admin/kategorier", icon: Tag },
  { label: "Annonser", href: "/admin/annonser", icon: Megaphone },
  { label: "Statistik", href: "/admin/statistik", icon: BarChart3 },
  { label: "Inställningar", href: "/admin/installningar", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true, username: true },
  });

  if (!profile || profile.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-sage-100 fixed h-full">
        {/* Logotyp */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sage-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">minodling</div>
            <div className="text-xs text-gray-400">Adminpanel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
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

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sage-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-green-700 transition-colors"
          >
            ← Tillbaka till sajten
          </Link>
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-sage-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="text-sm text-gray-500">
            Inloggad som{" "}
            <span className="font-medium text-gray-900">@{profile.username}</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-green-700 transition-colors"
            target="_blank"
          >
            Öppna sajten ↗
          </Link>
        </header>

        {/* Sidinnehåll */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
