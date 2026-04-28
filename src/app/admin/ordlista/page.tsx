import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteGlossaryTerm } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ordlista | Admin" };

export default async function OrdlistaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const terms = await prisma.glossaryTerm.findMany({
    where: params.search
      ? { term: { contains: params.search, mode: "insensitive" } }
      : {},
    orderBy: { term: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Odlingsordlista</h1>

      <form method="GET" action="/admin/ordlista" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Sök term..."
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-300 w-64"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-sm font-medium bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
        >
          Sök
        </button>
        {params.search && (
          <a
            href="/admin/ordlista"
            className="px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Rensa
          </a>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-sage-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Term</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kort beskrivning</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {terms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Inga termer hittades.
                </td>
              </tr>
            )}
            {terms.map((term) => (
              <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{term.term}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <span className="line-clamp-1">
                    {term.shortDescription
                      ? term.shortDescription.slice(0, 80)
                      : "–"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{term.category ?? "–"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(term.createdAt)}</td>
                <td className="px-4 py-3">
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await deleteGlossaryTerm(term.id);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
