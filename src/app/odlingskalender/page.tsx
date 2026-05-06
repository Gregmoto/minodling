export const revalidate = 300;
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { MONTHS, TASK_TYPES, SEASON_COLORS } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Odlingskalender – Vad man gör varje månad",
  description:
    "Månadsvis odlingskalender för svenska odlare. Se vad du ska så, plantera, skörda och gödsla varje månad – anpassad för din odlingszon.",
  alternates: { canonical: "https://minodling.se/odlingskalender" },
};

export default async function OdlingskalenderPage() {
  const user = await getCurrentUser();

  const [counts, profile] = await Promise.all([
    prisma.gardenCalendar.groupBy({
      by: ["month"],
      where: { status: "published" },
      _count: { id: true },
    }),
    user
      ? prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
        })
      : null,
  ]);

  const countByMonth = Object.fromEntries(counts.map((c) => [c.month, c._count.id]));
  const currentMonth = new Date().getMonth() + 1;

  const navUser = profile
    ? { id: profile.id, username: profile.username, displayName: profile.fullName, avatarUrl: profile.avatarUrl, role: profile.role }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-sage-50 to-cream-50 border-b border-sage-100 py-10">
          <div className="container-main">
            <Breadcrumbs items={[{ name: "Odlingskalender", href: "/odlingskalender" }]} className="mb-4" />
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 shrink-0">
                <CalendarDays className="h-7 w-7 text-green-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Odlingskalender</h1>
                <p className="mt-2 text-gray-600 max-w-xl">
                  Vad du ska göra i trädgården, månad för månad. Sådd, plantering, skörd,
                  gödsling, beskärning och säsongstips – anpassat för svenska förhållanden.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Månadsöversikt */}
        <section className="container-main py-10">
          {/* Nuvarande månad featured */}
          <div className="mb-8">
            {(() => {
              const m = MONTHS[currentMonth - 1];
              const count = countByMonth[currentMonth] ?? 0;
              return (
                <Link href={`/odlingskalender/${m.slug}`}>
                  <div className={`relative rounded-3xl bg-gradient-to-br ${SEASON_COLORS[m.season]} border border-sage-200 p-8 hover:shadow-lg transition-shadow group`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                          Just nu – {m.season}
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                          {m.full}
                        </h2>
                        {count > 0 && (
                          <p className="mt-2 text-gray-600">
                            {count} odlingsuppgifter att göra just nu
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-8xl font-black text-black/5 select-none leading-none">
                          {m.num}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-green-700 group-hover:gap-2.5 transition-all">
                      Se vad du bör göra i {m.full.toLowerCase()}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>

          {/* Alla 12 månader */}
          <h2 className="text-xl font-bold text-gray-900 mb-5">Välj månad</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {MONTHS.map((m) => {
              const count = countByMonth[m.num] ?? 0;
              const isCurrent = m.num === currentMonth;
              return (
                <Link key={m.slug} href={`/odlingskalender/${m.slug}`} className="group block">
                  <Card
                    hover
                    padding="md"
                    className={`h-full transition-all ${
                      isCurrent
                        ? "ring-2 ring-green-500 bg-green-50/50"
                        : "hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{m.season}</p>
                        <h3 className={`font-bold text-lg group-hover:text-green-700 transition-colors ${
                          isCurrent ? "text-green-700" : "text-gray-900"
                        }`}>
                          {m.full}
                        </h3>
                      </div>
                      <span className={`text-3xl font-black leading-none ${
                        isCurrent ? "text-green-100" : "text-gray-100"
                      }`}>
                        {m.num}
                      </span>
                    </div>
                    {count > 0 ? (
                      <p className="text-xs text-gray-500">{count} uppgifter</p>
                    ) : (
                      <p className="text-xs text-gray-300">Inga uppgifter än</p>
                    )}
                    {isCurrent && (
                      <span className="inline-block mt-2 text-xs font-medium text-green-600">
                        ● Just nu
                      </span>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Uppgiftstyper-guide */}
          <h2 className="text-xl font-bold text-gray-900 mb-5">Vad ingår i kalendern?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TASK_TYPES.map((t) => (
              <div key={t.value} className={`rounded-2xl border p-4 ${t.color}`}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="font-semibold text-sm">{t.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
