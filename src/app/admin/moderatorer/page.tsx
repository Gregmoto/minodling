import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Moderatorbehörigheter | Admin" };

const Check = () => <span className="text-green-600 font-semibold">✓</span>;
const Dash = () => <span className="text-gray-300">–</span>;

export default async function ModeratorsPage() {
  const moderators = await prisma.profile.findMany({
    where: { role: { in: ["admin", "moderator"] } },
    orderBy: { role: "asc" },
    include: { moderatorPermissions: true },
  });

  const roleBadge = (role: string) =>
    role === "admin" ? <Badge variant="danger">Admin</Badge> : <Badge variant="warning">Moderator</Badge>;

  return (
    <div className="space-y-4">
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Moderatorbehörigheter</h1>
          <span className="text-sm text-gray-500">{moderators.length} totalt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Roll</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hantera inlägg</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hantera kommentarer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Banna användare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hantera rapporter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {moderators.map((mod) => {
                const isAdmin = mod.role === "admin";
                const perm = mod.moderatorPermissions;
                return (
                  <tr key={mod.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{mod.fullName ?? mod.username}</div>
                      <div className="text-xs text-gray-400">@{mod.username}</div>
                    </td>
                    <td className="px-4 py-3">{roleBadge(mod.role)}</td>
                    <td className="px-4 py-3">{isAdmin || perm?.canModeratePosts ? <Check /> : <Dash />}</td>
                    <td className="px-4 py-3">{isAdmin || perm?.canModerateComments ? <Check /> : <Dash />}</td>
                    <td className="px-4 py-3">{isAdmin || perm?.canBanUsers ? <Check /> : <Dash />}</td>
                    <td className="px-4 py-3">{isAdmin || perm?.canManageReports ? <Check /> : <Dash />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <span className="mt-0.5">ℹ</span>
        <span>Admins har alltid alla behörigheter automatiskt.</span>
      </div>
    </div>
  );
}
