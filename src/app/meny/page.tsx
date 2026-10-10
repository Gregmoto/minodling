import type { Metadata } from "next";
import Link from "next/link";
import {
  MessagesSquare, BookOpen, HelpCircle, Repeat, ShoppingBag, Users,
  Library, BookA, Trophy, Calendar, CalendarDays, BellRing, NotebookPen,
  Stethoscope, Sparkles, Mail, Info, ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Meny",
  description: "Alla delar av Min Odling.",
  robots: "noindex",
};

/**
 * "Mer"-fliken i appen. Samlar allt som inte ryms i flikfältet och ger
 * appen en egen navigationsyta i stället för webbens hamburgermeny.
 *
 * Sidan är noindex – den finns för appen, inte för sök.
 */

const SECTIONS: { title: string; items: { href: string; label: string; icon: React.ElementType }[] }[] = [
  {
    title: "Din odling",
    items: [
      { href: "/dagbok",         label: "Odlingsdagbok",   icon: NotebookPen },
      { href: "/paminnelser",    label: "Påminnelser",     icon: BellRing },
      { href: "/odlingsvecka",   label: "Din odlingsvecka", icon: CalendarDays },
      { href: "/odlingskalender", label: "Odlingskalender", icon: Calendar },
    ],
  },
  {
    title: "Verktyg",
    items: [
      { href: "/vaxtdiagnos", label: "Växtdiagnos",  icon: Stethoscope },
      { href: "/premium",     label: "Premium",      icon: Sparkles },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/forum",      label: "Forum",          icon: MessagesSquare },
      { href: "/fragor",     label: "Frågor & svar",  icon: HelpCircle },
      { href: "/grupper",    label: "Grupper",        icon: Users },
      { href: "/utmaningar", label: "Utmaningar",     icon: Trophy },
      { href: "/frobyte",    label: "Fröbyte",        icon: Repeat },
    ],
  },
  {
    title: "Läs och lär",
    items: [
      { href: "/guider",       label: "Guider",         icon: BookOpen },
      { href: "/kunskapsbank", label: "Kunskapsbank",   icon: Library },
      { href: "/ordlista",     label: "Odlingsordlista", icon: BookA },
    ],
  },
  {
    title: "Övrigt",
    items: [
      { href: "/butik",   label: "Butik",   icon: ShoppingBag },
      { href: "/om-oss",  label: "Om oss",  icon: Info },
      { href: "/kontakt", label: "Kontakt", icon: Mail },
    ],
  },
];

export default function MenyPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-28">
      <header className="px-5 pt-6 pb-4">
        <h1 className="font-display text-3xl font-bold text-green-700">Meny</h1>
      </header>

      <div className="space-y-7 px-4">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-sage-600">
              {section.title}
            </h2>
            <ul className="overflow-hidden rounded-2xl border border-sage-200 bg-white">
              {section.items.map(({ href, label, icon: Icon }, i) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-4 py-3.5 active:bg-green-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                      <Icon className="h-[18px] w-[18px] text-green-700" />
                    </span>
                    <span className="flex-1 text-[15px] font-medium text-sage-900">
                      {label}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-sage-400" />
                  </Link>
                  {i < section.items.length - 1 && (
                    <div className="ml-16 h-px bg-sage-100" />
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
