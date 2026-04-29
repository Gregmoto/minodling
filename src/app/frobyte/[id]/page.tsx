export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Flag, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { EXCHANGE_TYPES, CATEGORIES, STATUS_CONFIG } from "../constants";
import { updateExchangeStatus, deleteExchange, reportExchange } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = await prisma.seedExchange.findUnique({ where: { id }, select: { title: true } });
  if (!e) return { title: "Annons hittades inte" };
  return { title: `${e.title} – Fröbyte & Plantbyte` };
}

export default async function ExchangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const exchange = await prisma.seedExchange.findUnique({
    where: { id },
    include: { owner: { select: { id: true, username: true, avatarUrl: true, fullName: true, createdAt: true } } },
  });

  if (!exchange) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navProfile = user ? await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
  }) : null;
  const navUser = navProfile
    ? { id: navProfile.id, username: navProfile.username, displayName: navProfile.fullName, avatarUrl: navProfile.avatarUrl, role: navProfile.role }
    : null;

  const isOwner = navProfile?.id === exchange.userId;
  const isAdmin = navProfile?.role === "admin" || navProfile?.role === "moderator";
  const canEdit = isOwner || isAdmin;

  const typeInfo   = EXCHANGE_TYPES.find((t) => t.value === exchange.exchangeType);
  const catInfo    = CATEGORIES.find((c) => c.value === exchange.category);
  const statusConf = STATUS_CONFIG[exchange.status] ?? STATUS_CONFIG.active;

  // Fler annonser från samma ägare
  const moreFromOwner = await prisma.seedExchange.findMany({
    where: { userId: exchange.userId, id: { not: id }, status: { not: "closed" } },
    select: { id: true, title: true, exchangeType: true, category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />
      <main className="flex-1 bg-cream-50">
        <div className="container-main py-8">
          <Link href="/frobyte" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Alla annonser
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Huvud */}
            <article className="flex-1 min-w-0 space-y-6">
              {/* Bild */}
              {exchange.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={exchange.imageUrl} alt={exchange.title} className="w-full max-h-80 object-cover" />
                </div>
              )}

              {/* Rubrik + badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {typeInfo && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-sage-50 text-sage-800 border border-sage-200">
                      {typeInfo.emoji} {typeInfo.label}
                    </span>
                  )}
                  {catInfo && (
                    <Badge variant="outline">{catInfo.emoji} {catInfo.value}</Badge>
                  )}
                  <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${statusConf.cls}`}>
                    {statusConf.label}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{exchange.title}</h1>
                {exchange.variety && (
                  <p className="text-sage-700 font-medium mt-1">Sort: {exchange.variety}</p>
                )}
                {exchange.exchangeType === "sell" && exchange.price && (
                  <p className="text-2xl font-bold text-green-700 mt-2">{exchange.price} kr</p>
                )}
              </div>

              {/* Beskrivning */}
              {exchange.description && (
                <Card>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{exchange.description}</p>
                </Card>
              )}

              {/* Plats */}
              {exchange.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{exchange.location}</span>
                </div>
              )}

              <p className="text-xs text-gray-400">Publicerad {formatDate(exchange.createdAt)}</p>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-5">

              {/* Säljare/Annonsör */}
              <Card>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Annonsör</p>
                <Link href={`/profil/${exchange.owner.username}`} className="flex items-center gap-3 group">
                  {exchange.owner.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={exchange.owner.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 text-lg font-bold shrink-0">
                      {exchange.owner.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                      {exchange.owner.fullName ?? exchange.owner.username}
                    </p>
                    <p className="text-xs text-gray-400">@{exchange.owner.username}</p>
                  </div>
                </Link>

                {/* Kontakt – placeholder för framtida meddelanden */}
                {user && !isOwner && exchange.status === "active" && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-1">Kontakta via profilen eller Forum</p>
                    <Link href={`/profil/${exchange.owner.username}`}
                      className="block w-full py-2 bg-sage-600 text-white text-sm font-medium rounded-lg hover:bg-sage-700 transition-colors">
                      Visa profil
                    </Link>
                  </div>
                )}
              </Card>

              {/* Ägarens åtgärder */}
              {canEdit && (
                <Card>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Hantera annons</p>
                  <div className="space-y-2">
                    {/* Statusbyte */}
                    {[
                      { s: "active",   label: "Markera aktiv" },
                      { s: "reserved", label: "Markera reserverad" },
                      { s: "closed",   label: "Avsluta annons" },
                    ].filter(({ s }) => s !== exchange.status).map(({ s, label }) => (
                      <form key={s} action={async () => { "use server"; await updateExchangeStatus(id, s); }}>
                        <button type="submit" className={`w-full py-2 text-sm rounded-lg transition-colors ${
                          s === "closed" ? "bg-gray-100 text-gray-600 hover:bg-gray-200" :
                          s === "reserved" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" :
                          "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}>
                          {label}
                        </button>
                      </form>
                    ))}
                    <form action={async () => { "use server"; await deleteExchange(id); }}>
                      <button type="submit" className="flex items-center gap-1.5 w-full py-2 text-sm text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="h-4 w-4" /> Ta bort annons
                      </button>
                    </form>
                  </div>
                </Card>
              )}

              {/* Rapportera */}
              {user && !isOwner && (
                <Card>
                  <form action={async (fd) => {
                    "use server";
                    const reason = fd.get("reason") as string;
                    if (reason) await reportExchange(id, reason);
                  }} className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rapportera annons</p>
                    <select name="reason" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white">
                      <option value="">Välj anledning...</option>
                      <option value="spam">Spam</option>
                      <option value="inappropriate">Olämpligt innehåll</option>
                      <option value="misleading">Vilseledande</option>
                      <option value="other">Annat</option>
                    </select>
                    <button type="submit" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 transition-colors">
                      <Flag className="h-3.5 w-3.5" /> Skicka rapport
                    </button>
                  </form>
                </Card>
              )}

              {/* Fler från samma annonsör */}
              {moreFromOwner.length > 0 && (
                <Card>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Fler från {exchange.owner.username}
                  </p>
                  <div className="space-y-2">
                    {moreFromOwner.map((e) => {
                      const t = EXCHANGE_TYPES.find((x) => x.value === e.exchangeType);
                      return (
                        <Link key={e.id} href={`/frobyte/${e.id}`}
                          className="block text-sm text-gray-700 hover:text-green-700 transition-colors line-clamp-1">
                          {t?.emoji} {e.title}
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
