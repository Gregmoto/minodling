import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "SEO | Admin" };

export default async function SeoPage() {
  const settings = await prisma.seoSetting.findMany({
    orderBy: { pageType: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO-inställningar</h1>
        <p className="text-sm text-gray-500 mt-1">
          SEO-inställningar hämtas från databasen och kan redigeras direkt.
        </p>
      </div>

      {settings.length === 0 ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
          Lägg till SEO-inställningar via API eller direkt i databasen.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sidtyp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Meta-titel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Meta-beskrivning</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">OG-bild</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Noindex</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Uppdaterad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {settings.map((s) => (
                <tr key={s.pageType + (s.pageId ?? "")} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.pageType}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.metaTitle ? (
                      s.metaTitle
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <span className="line-clamp-1">{s.metaDescription ?? <span className="text-gray-300">–</span>}</span>
                  </td>
                  <td className="px-4 py-3">
                    {s.ogImage ? (
                      <span className="text-green-600 font-medium">Inställd</span>
                    ) : (
                      <span className="text-gray-400">Saknas</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.noindex ? (
                      <Badge variant="danger">Ja</Badge>
                    ) : (
                      <Badge variant="success">Nej</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(s.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
