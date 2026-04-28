export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteQuestion } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Frågor & svar | Admin" };

const STATUS_FILTERS = [
  { value: "all",      label: "Alla" },
  { value: "open",     label: "Öppna" },
  { value: "answered", label: "Besvarade" },
  { value: "closed",   label: "Stängda" },
];

function statusBadge(status: string) {
  if (status === "open")     return <Badge variant="success">Öppen</Badge>;
  if (status === "answered") return <Badge variant="warning">Besvarad</Badge>;
  if (status === "closed")   return <Badge variant="default">Stängd</Badge>;
  if (status === "removed")  return <Badge variant="danger">Borttagen</Badge>;
  return <Badge>{status}</Badge>;
}

export default async function FragorPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  const questions = await prisma.question.findMany({
    where: { ...(params.status ? { status: params.status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { username: true } } },
  });

  const activeFilter = params.status ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Frågor &amp; svar</h1>
          <p className="text-gray-500 text-sm mt-1">{questions.length} totalt</p>
        </div>
      </div>

      {/* Statusfilter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ value, label }) => {
          const href = value === "all" ? "/admin/fragor" : `/admin/fragor?status=${value}`;
          return (
            <Link
              key={value}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === value
                  ? "bg-sage-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fråga</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Svar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Visningar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Författare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-xs">
                    <span className="line-clamp-1 font-medium text-gray-900">{q.title}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{q.category ?? "–"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={q.answersCount > 0 ? "success" : "default"}>
                      {q.answersCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{q.viewsCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {q.author?.username ? `@${q.author.username}` : "–"}
                  </td>
                  <td className="px-4 py-3">{statusBadge(q.status)}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {formatDate(q.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton action={async () => { "use server"; await deleteQuestion(q.id); }} />
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Inga frågor hittades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
