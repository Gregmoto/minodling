import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { updateUserRole } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Roller | Admin" };

export default async function RollerPage() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, fullName: true, role: true, createdAt: true, points: true },
  });

  const admins = users.filter((u) => u.role === "admin").length;
  const moderators = users.filter((u) => u.role === "moderator").length;
  const regular = users.filter((u) => u.role === "user").length;

  const roleBadge = (role: string) => {
    if (role === "admin") return <Badge variant="danger">Admin</Badge>;
    if (role === "moderator") return <Badge variant="warning">Moderator</Badge>;
    return <Badge variant="default">Användare</Badge>;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {admins} admin · {moderators} moderatorer · {regular} användare
      </p>

      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Roller</h1>
          <span className="text-sm text-gray-500">{users.length} totalt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Användare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Roll</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Poäng</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registrerad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{user.fullName ?? user.username}</div>
                    <div className="text-xs text-gray-400">@{user.username}</div>
                  </td>
                  <td className="px-4 py-3">{roleBadge(user.role)}</td>
                  <td className="px-4 py-3 text-gray-700">{user.points}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        await updateUserRole(user.id, formData.get("role") as string);
                      }}
                      className="flex items-center gap-2"
                    >
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-sage-300"
                      >
                        <option value="user">Användare</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                      >
                        Uppdatera
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
