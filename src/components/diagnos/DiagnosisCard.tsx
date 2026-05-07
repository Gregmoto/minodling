import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { PROBLEM_TYPES, STATUS_LABELS } from "@/app/vaxtdiagnos/constants";

interface Props {
  diagnosis: {
    id: string;
    imageUrl: string;
    description: string;
    plantName: string | null;
    problemType: string | null;
    status: string;
    createdAt: Date;
    profile: { username: string; avatarUrl: string | null };
    plant: { name: string; slug: string } | null;
    _count: { comments: number };
  };
}

export function DiagnosisCard({ diagnosis: d }: Props) {
  const problemInfo = PROBLEM_TYPES.find((p) => p.value === d.problemType);
  const statusInfo  = STATUS_LABELS[d.status] ?? STATUS_LABELS["open"];
  const plantLabel  = d.plant?.name ?? d.plantName;

  return (
    <Link href={`/vaxtdiagnos/${d.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        {/* Bild */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={d.imageUrl}
            alt="Växtproblem"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm ${
              d.status === "resolved" ? "text-green-700" :
              d.status === "diagnosed" ? "text-amber-700" : "text-blue-700"
            }`}>
              {statusInfo.label}
            </span>
          </div>
          {/* Problemtyp */}
          {problemInfo && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700">
                {problemInfo.emoji} {problemInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* Innehåll */}
        <div className="p-4 space-y-3">
          {plantLabel && (
            <p className="text-xs font-medium text-sage-700 flex items-center gap-1">
              🌱 {plantLabel}
            </p>
          )}
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{d.description}</p>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              {d.profile.avatarUrl ? (
                <Image src={d.profile.avatarUrl} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 text-xs font-bold">
                  {d.profile.username[0].toUpperCase()}
                </div>
              )}
              <span>{d.profile.username}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {d._count.comments}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(d.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
