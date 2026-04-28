import type { Metadata } from "next";
import { Search } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Användare | Admin" };

export default async function AdminUsersPage() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { posts: true, comments: true } } },
  });

  const roleConfig: Record<string, { label: string; variant: "default" | "warning" | "danger" | "success" }> = {
    user:      { label: "Användare",  variant: "default" },
    moderator: { label: "Moderator",  variant: "warning" },
    admin:     { label: "Admin",      variant: "danger" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Användare</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} totalt</p>
      </div>

      <Card padding="sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="search" placeholder="Sök användare..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-sage-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sage-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Användare</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Roll</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Inlägg</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Poäng</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden lg:table-cell">Registrerad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {users.map((user) => {
                const rc = roleConfig[user.role] ?? roleConfig.user;
                return (
                  <tr key={user.id} className="hover:bg-sage-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatarUrl} fallback={user.fullName ?? user.username} size="sm" />
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName ?? user.username}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-gray-600">{user._count.posts}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-gray-600">{user.points}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
