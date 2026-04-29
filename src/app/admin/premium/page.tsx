export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Crown, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { activatePremiumManually, cancelPremium } from "@/lib/premium";

export const metadata: Metadata = { title: "Premium-prenumerationer | Admin" };

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  inactive: "bg-gray-100 text-gray-500",
  canceled: "bg-red-100 text-red-600",
  past_due: "bg-orange-100 text-orange-700",
};

export default async function AdminPremiumPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { id: true, username: true, email: true, avatarUrl: true } },
    },
  });

  const activeCount  = subscriptions.filter((s) => s.status === "active" || s.status === "trialing").length;
  const canceledCount = subscriptions.filter((s) => s.status === "canceled").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" /> Premium
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} aktiva · {canceledCount} avslutade
          </p>
        </div>
      </div>

      {/* Stripe-status-banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <p className="font-medium">Stripe är inte anslutet ännu</p>
          <p className="text-amber-700 mt-0.5">
            Lägg till <code className="bg-amber-100 px-1 rounded text-xs">STRIPE_SECRET_KEY</code> och{" "}
            <code className="bg-amber-100 px-1 rounded text-xs">STRIPE_WEBHOOK_SECRET</code> i <code className="bg-amber-100 px-1 rounded text-xs">.env</code>{" "}
            och skapa en webhook-handler på <code className="bg-amber-100 px-1 rounded text-xs">/api/webhooks/stripe</code> för att aktivera automatisk betalning.
            Tills dess kan du aktivera premium manuellt nedan.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {subscriptions.length === 0 ? (
          <div className="p-10 text-center">
            <Crown className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Inga prenumerationer ännu.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Användare</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Förfaller</th>
                <th className="px-4 py-3 hidden lg:table-cell">Stripe</th>
                <th className="px-4 py-3 text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {sub.profile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sub.profile.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700 flex-shrink-0">
                          {sub.profile.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{sub.profile.username}</div>
                        {sub.profile.email && <div className="text-xs text-gray-400">{sub.profile.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize font-medium text-gray-700">{sub.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLE[sub.status] ?? STATUS_STYLE.inactive}`}>
                      {sub.status}
                    </span>
                    {sub.cancelAtPeriodEnd && (
                      <span className="ml-1.5 text-xs text-orange-500">· Avslutas</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                    {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "–"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {sub.stripeSubscriptionId ? (
                      <span className="text-xs text-gray-400 font-mono truncate max-w-[140px] block">{sub.stripeSubscriptionId}</span>
                    ) : (
                      <span className="text-xs text-gray-300">Ej anslutet</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {sub.status !== "active" ? (
                        <form action={async () => {
                          "use server";
                          await activatePremiumManually(sub.profile.id);
                        }}>
                          <button type="submit"
                            className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors">
                            Aktivera
                          </button>
                        </form>
                      ) : (
                        <form action={async () => {
                          "use server";
                          await cancelPremium(sub.profile.id, false);
                        }}>
                          <button type="submit"
                            className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            Avsluta
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
