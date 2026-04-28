import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Poängsystem | Admin" };

const SETTING_LABELS: Record<string, string> = {
  points_per_post: "Poäng per inlägg",
  points_per_comment: "Poäng per kommentar",
  points_per_answer: "Poäng per svar",
  points_per_like: "Poäng per gillning",
};

export default async function PoangPage() {
  const [settings, transactions, topUsers] = await Promise.all([
    prisma.adminSetting.findMany({
      where: {
        key: {
          in: [
            "points_per_post",
            "points_per_comment",
            "points_per_answer",
            "points_per_like",
          ],
        },
      },
    }),
    prisma.pointTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { profile: { select: { username: true } } },
    }),
    prisma.profile.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: { id: true, username: true, fullName: true, points: true },
    }),
  ]);

  const settingMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Poängsystem</h1>

      {/* Poäng-inställningar */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Poängvärden</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(
            [
              "points_per_post",
              "points_per_comment",
              "points_per_answer",
              "points_per_like",
            ] as const
          ).map((key) => (
            <Card key={key} className="text-center">
              <p className="text-3xl font-bold text-sage-700">
                {settingMap[key] ?? "–"}
              </p>
              <p className="mt-1 text-sm text-gray-500">{SETTING_LABELS[key]}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Topplista */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Topplista</h2>
          <div className="bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rank</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Poäng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                      Inga användare hittades.
                    </td>
                  </tr>
                )}
                {topUsers.map((user, i) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-medium">#{i + 1}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {user.fullName ?? user.username ?? "–"}
                      {user.username && (
                        <span className="ml-1 text-gray-400 text-xs">@{user.username}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-sage-700">
                      {user.points ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Senaste transaktioner */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Senaste transaktioner</h2>
          <div className="bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Poäng</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Anledning</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      Inga transaktioner hittades.
                    </td>
                  </tr>
                )}
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">
                      {tx.profile?.username ?? "–"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        tx.points >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.points >= 0 ? "+" : ""}
                      {tx.points}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                      {tx.reason ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
