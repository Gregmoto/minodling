"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Shield, ShieldCheck, FileText, MessageSquare,
  HelpCircle, Leaf, CalendarDays, BookOpen, Library, BookText,
  Megaphone, Star, Flag, Search, Settings, ChevronRight,
  ShoppingBag, Package, FolderOpen, Receipt, UserCheck, Tag, Mail, Images, ThumbsUp,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: null,
    items: [
      { label: "Dashboard",          href: "/admin",               icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Användare",
    items: [
      { label: "Användare",          href: "/admin/anvandare",     icon: Users },
      { label: "Roller",             href: "/admin/roller",        icon: Shield },
      { label: "Moderatorbehörigh.", href: "/admin/moderatorer",   icon: ShieldCheck },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Kontaktärenden",     href: "/admin/kontakt",       icon: Inbox },
    ],
  },
  {
    label: "Innehåll",
    items: [
      { label: "Inlägg",             href: "/admin/inlagg",        icon: FileText },
      { label: "Kommentarer",        href: "/admin/kommentarer",   icon: MessageSquare },
      { label: "Frågor & svar",      href: "/admin/fragor",        icon: HelpCircle },
    ],
  },
  {
    label: "Växter & odling",
    items: [
      { label: "Växtdatabas",        href: "/admin/vaxter",        icon: Leaf },
      { label: "Odlingskalender",    href: "/admin/kalender",      icon: CalendarDays },
    ],
  },
  {
    label: "Kunskap",
    items: [
      { label: "Guider",             href: "/admin/guider",        icon: BookOpen },
      { label: "Kunskapsbank",       href: "/admin/kunskapsbank",  icon: Library },
      { label: "Odlingsordlista",    href: "/admin/ordlista",      icon: BookText },
    ],
  },
  {
    label: "Butik",
    items: [
      { label: "Översikt",       href: "/admin/butik",               icon: ShoppingBag, exact: true },
      { label: "Slides",         href: "/admin/butik/slides",         icon: Images },
      { label: "Startsida",      href: "/admin/butik/startsida",      icon: FileText },
      { label: "Produkter",      href: "/admin/butik/produkter",      icon: Package },
      { label: "Kategorier",     href: "/admin/butik/kategorier",     icon: FolderOpen },
      { label: "Ordrar",         href: "/admin/butik/ordrar",         icon: Receipt },
      { label: "Kunder",         href: "/admin/butik/kunder",         icon: UserCheck },
      { label: "Rabattkoder",    href: "/admin/butik/rabattkoder",    icon: Tag },
      { label: "Omdömen",        href: "/admin/butik/omdomen",        icon: ThumbsUp },
      { label: "Nyhetsbrev",     href: "/admin/butik/nyhetsbrev",     icon: Mail },
      { label: "Inställningar",  href: "/admin/butik/installningar",  icon: Settings },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Banners",            href: "/admin/annonser",      icon: Megaphone },
      { label: "Poängsystem",        href: "/admin/poang",         icon: Star },
      { label: "Rapporter",          href: "/admin/rapporter",     icon: Flag },
      { label: "SEO",                href: "/admin/seo",           icon: Search },
      { label: "Inställningar",      href: "/admin/installningar", icon: Settings },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = "exact" in item && item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {active && <ChevronRight className="h-3 w-3 shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
