import type { Metadata } from "next";
import { Flag, FileText, MessageSquare, CheckCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireModerator } from "@/lib/auth";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Moderatorpanel | Minodling" };

export default async function ModeratorPage() {
  await requireModerator();

  const [pendingReports, recentPosts, recentComments] = await Promise.all([
    prisma.report.count({ where: { status: "pending" } }),
    prisma.post.count({ where: { status: "published", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.postComment.count({ where: { status: "published", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    ]);

  const stats = [
    { label: "Väntande rapporter", value: pendingReports, icon: Flag,         color: "text-red-600 bg-red-50" },
    { label: "Inlägg senaste dygn", value: recentPosts,   icon: FileText,     color: "text-blue-600 bg-blue-50" },
    { label: "Kommentarer senaste dygn", value: recentComments, icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
  ];

  const recentReports = await prisma.report.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      reporter: { select: { username: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderatoröversikt</h1>
        <p className="text-gray-500 text-sm mt-1">Hantera rapporter och innehåll</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <Card padding="none">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-sage-100">
          <Flag className="h-4 w-4 text-red-500" />
          <h2 className="font-semibold text-gray-900 text-sm">Väntande rapporter</h2>
        </div>
        {recentReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-10 w-10 text-green-400 mb-3" />
            <p className="text-gray-500 text-sm">Inga väntande rapporter 🎉</p>
          </div>
        ) : (
          <div className="divide-y divide-sage-100">
            {recentReports.map((report) => (
              <div key={report.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {report.targetType} · Anmält av @{report.reporter.username}
                  </p>
                </div>
                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full shrink-0">
                  Väntar
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
