import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { toggleArticlePublished, deleteArticle } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kunskapsbank | Admin" };

export default async function KunskapsbanksPage() {
  const articles = await prisma.knowledgeArticle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Kunskapsbank</h1>

      <div className="bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Titel</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Inga artiklar hittades.
                </td>
              </tr>
            )}
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {article.title}
                </td>
                <td className="px-4 py-3 text-gray-600">{article.category ?? "–"}</td>
                <td className="px-4 py-3">
                  {article.published ? (
                    <Badge variant="success">Publicerad</Badge>
                  ) : (
                    <Badge variant="default">Utkast</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(article.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await toggleArticlePublished(article.id, !article.published);
                      }}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-sage-700 bg-sage-50 hover:bg-sage-100 rounded-lg transition-colors"
                      >
                        {article.published ? "Avpublicera" : "Publicera"}
                      </button>
                    </form>
                    <DeleteButton
                      action={async () => {
                        "use server";
                        await deleteArticle(article.id);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
