import Link from "next/link";
import { Users, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Props {
  group: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    location: string | null;
    category: string;
    imageUrl: string | null;
    _count: { members: number };
  };
  isMember?: boolean;
}

export function GroupCard({ group: g, isMember }: Props) {
  const isRegion = g.category === "region";

  return (
    <Link href={`/grupper/${g.slug}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
        {/* Bild eller färgad header */}
        {g.imageUrl ? (
          <div className="h-36 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ) : (
          <div className={`h-36 flex items-center justify-center text-4xl ${
            isRegion ? "bg-gradient-to-br from-blue-50 to-sky-100" : "bg-gradient-to-br from-green-50 to-emerald-100"
          }`}>
            {isRegion ? "📍" : "🌱"}
          </div>
        )}

        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="flex items-start gap-2 justify-between">
            <h2 className="text-base font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
              {g.name}
            </h2>
            <Badge variant="outline" size="sm" className="shrink-0">
              {isRegion ? <><MapPin className="h-2.5 w-2.5 inline mr-0.5" />Region</> : <><Tag className="h-2.5 w-2.5 inline mr-0.5" />Intresse</>}
            </Badge>
          </div>

          {g.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">{g.description}</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {g._count.members} {g._count.members === 1 ? "medlem" : "medlemmar"}
            </span>
            {isMember && (
              <span className="text-green-600 font-medium">✓ Medlem</span>
            )}
            {g.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {g.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
