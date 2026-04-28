import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteComment, updateCommentStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kommentarer | Admin" };

const STATUS_LABELS: Record<string, string> = {
  all: "Alla",
  published: "Publicerade",
  removed: "Borttagna",
};

const statusBadge = (status: string) => {
  if (status === "published") return <Badge variant="success">Publicerad</Badge>;
  if (status === "removed") return <Badge variant="danger">Borttagen</Badge>;
  return <Badge>{status}</Badge>;
};

export default async function KommentarerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  const comments = await prisma.postComment.findMany({
    where: { ...(params.status ? { status: params.status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { username: true } },
      post: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(STATUS_LABELS).map(([value, label]) => {
          const active = (params.status ?? "all") === value;
          const href = value === "all" ? "/admin/kommentarer" : `/admin/kommentarer?status=${value}`;
          return (
            <Link
              key={value}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Kommentarer</h1>
          <span className="text-sm text-gray-500">{comments.length} visas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Innehåll</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Inlägg</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Författare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="line-clamp-2 text-gray-700">
                      {comment.content.slice(0, 100)}
                      {comment.content.length > 100 ? "…" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    {comment.post ? (
                      <Link
                        href={`/forum/${comment.post.id}`}
                        className="line-clamp-1 text-sage-700 hover:underline text-xs"
                      >
                        {comment.post.title}
                      </Link>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">@{comment.author?.username ?? "–"}</td>
                  <td className="px-4 py-3">{statusBadge(comment.status)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(comment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DeleteButton action={async () => { "use server"; await deleteComment(comment.id); }} />
                      {comment.status === "published" && (
                        <form action={async () => { "use server"; await updateCommentStatus(comment.id, "removed"); }}>
                          <button
                            type="submit"
                            className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            Ta bort
                          </button>
                        </form>
                      )}
                    </div>
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
