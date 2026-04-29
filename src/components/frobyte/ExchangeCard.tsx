import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EXCHANGE_TYPES, STATUS_CONFIG } from "@/app/frobyte/constants";

interface Props {
  exchange: {
    id: string;
    title: string;
    description: string | null;
    variety: string | null;
    exchangeType: string;
    category: string | null;
    location: string | null;
    price: number | null;
    imageUrl: string | null;
    status: string;
    createdAt: Date;
    owner: { username: string; avatarUrl: string | null };
  };
}

export function ExchangeCard({ exchange: e }: Props) {
  const typeInfo   = EXCHANGE_TYPES.find((t) => t.value === e.exchangeType);
  const statusConf = STATUS_CONFIG[e.status] ?? STATUS_CONFIG.active;

  return (
    <Link href={`/frobyte/${e.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
        {/* Bild / Placeholder */}
        <div className="relative h-44 bg-gray-50 overflow-hidden">
          {e.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {e.category === "Frön" ? "🫘" : e.category === "Plantor" ? "🌱" : e.category === "Sticklingar" ? "✂️" : e.category === "Verktyg" ? "🔧" : "📦"}
            </div>
          )}
          {/* Typ-badge */}
          {typeInfo && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700">
                {typeInfo.emoji} {typeInfo.label}
              </span>
            </div>
          )}
          {/* Status-badge */}
          {e.status !== "active" && (
            <div className="absolute top-2 right-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusConf.cls}`}>
                {statusConf.label}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
              {e.title}
            </h2>
            {e.variety && <p className="text-xs text-sage-600 mt-0.5">Sort: {e.variety}</p>}
          </div>

          {e.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">{e.description}</p>
          )}

          {e.exchangeType === "sell" && e.price && (
            <p className="text-sm font-bold text-green-700">{e.price} kr</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              {e.owner.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.owner.avatarUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 text-xs font-bold">
                  {e.owner.username[0].toUpperCase()}
                </div>
              )}
              <span>{e.owner.username}</span>
            </div>
            <div className="flex items-center gap-2">
              {e.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{e.location}</span>}
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{formatDate(e.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
