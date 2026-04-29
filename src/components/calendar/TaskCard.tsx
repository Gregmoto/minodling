import { getTaskType } from "@/lib/calendar";
import { Badge } from "@/components/ui/Badge";

interface TaskCardProps {
  title: string;
  taskType: string | null;
  category: string | null;
  description: string | null;
  growingZone?: string | null;
  growingType?: string | null;
  isUserSuggested?: boolean;
}

const GROWING_TYPE_LABELS: Record<string, string> = {
  garden:     "🌳 Trädgård",
  balcony:    "🪴 Balkong",
  greenhouse: "🏡 Växthus",
  indoor:     "🪟 Inomhus",
  allotment:  "🌱 Kolonilott",
};

export function TaskCard({
  title,
  taskType,
  category,
  description,
  growingZone,
  growingType,
  isUserSuggested,
}: TaskCardProps) {
  const type = getTaskType(taskType);

  return (
    <div className={`rounded-2xl border p-4 ${type.color}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5" role="img" aria-label={type.label}>
          {type.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {type.label}
            </span>
            {category && (
              <Badge variant="outline" size="sm">{category}</Badge>
            )}
            {growingType && GROWING_TYPE_LABELS[growingType] && (
              <Badge variant="outline" size="sm">{GROWING_TYPE_LABELS[growingType]}</Badge>
            )}
            {growingZone && (
              <Badge variant="outline" size="sm">Zon {growingZone}</Badge>
            )}
            {isUserSuggested && (
              <Badge variant="default" size="sm">💡 Odlartips</Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm leading-snug">{title}</h3>
          {description && (
            <p className="mt-1.5 text-sm opacity-80 leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
