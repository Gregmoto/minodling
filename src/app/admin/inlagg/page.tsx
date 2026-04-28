import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deletePost, updatePostStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inlägg | Admin" };

const STATUS_LABELS: Record<string, string> = {
  all: "Alla",
  published: "Publicerade",
  pinned: "Fästa",
  locked: "Låsta",
  removed: "Borttagna",
};

const statusBadge = (status: string) => {
  if (status === "published") return <Badge variant="success">Publicerad</Badge>;
  if (status === "pinned") return <Badge variant="warning">Fäst</Badge>;
  if (status === "locked") return <Badge variant="default">Låst</Badge>;
  if (status === "removed") return <Badge variant="danger">Borttagen</Badge>;
  return <Badge>{status}</Badge>;
};

export default async function InlaggPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;

  const posts = await prisma.post.findMany({
    where: {
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { title: { contains: params.search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { username: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(STATUS_LABELS).map(([value, label]) => {
          const active = (params.status ?? "all") === value;
          const href = value === "all" ? "/admin/inlagg" : `/admin/inlagg?status=${value}`;
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

        {/* Sökfält */}
        <form method="GET" action="/admin/inlagg" className="ml-auto flex gap-2">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <input
            type="text"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Sök titel..."
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-300"
          />
          <button
            type="submit"
            className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Sök
          </button>
        </form>
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Inlägg</h1>
          <span className="text-sm text-gray-500">{posts.length} visas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Författare</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kommentarer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Gillar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-[220px]">
                    <span className="line-clamp-1 text-gray-900 font-medium">{post.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    {post.category ? (
                      <Badge variant="success">{post.category}</Badge>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">@{post.author?.username ?? "–"}</td>
                  <td className="px-4 py-3 text-gray-700">{post._count.comments}</td>
                  <td className="px-4 py-3 text-gray-700">{post.likesCount ?? 0}</td>
                  <td className="px-4 py-3">{statusBadge(post.status)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(post.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DeleteButton action={async () => { "use server"; await deletePost(post.id); }} />
                      {post.status === "locked" ? (
                        <form action={async () => { "use server"; await updatePostStatus(post.id, "published"); }}>
                          <button
                            type="submit"
                            className="text-xs px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            Publicera
                          </button>
                        </form>
                      ) : (
                        <form action={async () => { "use server"; await updatePostStatus(post.id, "locked"); }}>
                          <button
                            type="submit"
                            className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Lås
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
