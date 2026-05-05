import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import Link from "next/link";

const _getRelated = unstable_cache(
  async (plantName: string) =>
    Promise.all([
      prisma.guide.findMany({
        where: {
          published: true,
          OR: [
            { title:   { contains: plantName, mode: "insensitive" } },
            { content: { contains: plantName, mode: "insensitive" } },
          ],
        },
        select: { slug: true, title: true },
        take: 3,
      }),
      prisma.glossaryTerm.findMany({
        where: {
          OR: [
            { term:            { contains: plantName, mode: "insensitive" } },
            { fullDescription: { contains: plantName, mode: "insensitive" } },
          ],
        },
        select: { slug: true, term: true },
        take: 4,
      }),
    ]),
  ["plant-related-v2"],
  { revalidate: 300, tags: ["plants"] },
);

interface Props {
  plantName: string;
  relatedGuides: { slug: string; title: string }[];
  relatedTerms:  { slug: string; term: string }[];
}

/**
 * Renderas direkt med props från page.tsx (cached data).
 * Exporteras även som async server component om vi vill använda Suspense.
 */
export function PlantRelatedLinks({ relatedGuides, relatedTerms }: Omit<Props, "plantName">) {
  if (relatedGuides.length === 0 && relatedTerms.length === 0) return null;
  return (
    <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
      {relatedGuides.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Relaterade guider</p>
          <div className="space-y-1.5">
            {relatedGuides.map((g) => (
              <Link key={g.slug} href={`/guider/${g.slug}`}
                className="block text-sm text-gray-600 hover:text-green-700 transition-colors">
                📖 {g.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      {relatedTerms.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Odlingsordlista</p>
          <div className="flex flex-wrap gap-2">
            {relatedTerms.map((t) => (
              <Link key={t.slug} href={`/ordlista/${t.slug}`}
                className="text-xs px-2.5 py-1 bg-sage-50 text-sage-700 rounded-full hover:bg-sage-100 border border-sage-200 transition-colors">
                {t.term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
