export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Poäng – Lojalitetsprogram | Admin" };

export default async function AdminPoangPage() {
  await requireAdmin();

  const [topBalances, recentTx, totalCirculation] = await Promise.all([
    prisma.shopLoyaltyBalance
      .findMany({
        orderBy: { balance: "desc" },
        take: 10,
        include: {
          user: { select: { fullName: true, email: true, username: true } },
        },
      })
      .catch(() => []),
    prisma.shopLoyaltyTransaction
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { fullName: true, username: true } },
        },
      })
      .catch(() => []),
    prisma.shopLoyaltyBalance
      .aggregate({ _sum: { balance: true } })
      .catch(() => ({ _sum: { balance: 0 } })),
  ]);

  const totalPoints = totalCirculation._sum.balance ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Poäng – Lojalitetsprogram</h1>
        <p className="text-gray-500 text-sm mt-1">1 poäng per 10 kr. Översikt över utdelade poäng.</p>
      </div>

      {/* Totalt i cirkulation */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <span className="text-2xl">⭐</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Totalt poäng i cirkulation</p>
            <p className="text-3xl font-bold text-gray-900">{totalPoints.toLocaleString("sv-SE")}</p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 10 användare */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top-saldo</h2>
            <p className="text-xs text-gray-400 mt-0.5">Topp 10 användare efter saldo</p>
          </div>
          {topBalances.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Inga poäng delade ut ännu.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {topBalances.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {b.user.fullName ?? b.user.username ?? "–"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{b.user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-amber-600">{b.balance} p</p>
                    <p className="text-[11px] text-gray-400">totalt {b.totalEarned} tjänat</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Senaste transaktioner */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Senaste transaktioner</h2>
            <p className="text-xs text-gray-400 mt-0.5">De 20 senaste poänghändelserna</p>
          </div>
          {recentTx.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Inga transaktioner ännu.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tx.user.fullName ?? tx.user.username ?? "–"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{tx.description ?? tx.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.points >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.points >= 0 ? "+" : ""}{tx.points} p
                    </p>
                    <p className="text-[11px] text-gray-400">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
