export const PROBLEM_STATUSES = [
  { key: "open",         label: "Ny",          emoji: "🆕", color: "blue"   },
  { key: "treated",      label: "Åtgärdad",    emoji: "🌱", color: "amber"  },
  { key: "following_up", label: "Följer upp",  emoji: "👀", color: "purple" },
  { key: "resolved",     label: "Löst",        emoji: "✅", color: "green"  },
] as const;

export type ProblemStatusKey = typeof PROBLEM_STATUSES[number]["key"];

export function getStatus(key: string) {
  return PROBLEM_STATUSES.find((s) => s.key === key) ?? PROBLEM_STATUSES[0];
}

export const STATUS_COLORS: Record<string, string> = {
  open:         "bg-blue-100 text-blue-700 border-blue-200",
  treated:      "bg-amber-100 text-amber-700 border-amber-200",
  following_up: "bg-purple-100 text-purple-700 border-purple-200",
  resolved:     "bg-green-100 text-green-700 border-green-200",
};
