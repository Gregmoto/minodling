export const MONTHS = [
  { num: 1,  slug: "januari",   short: "Jan", full: "Januari",   season: "Vinter" },
  { num: 2,  slug: "februari",  short: "Feb", full: "Februari",  season: "Vinter" },
  { num: 3,  slug: "mars",      short: "Mar", full: "Mars",      season: "Vår" },
  { num: 4,  slug: "april",     short: "Apr", full: "April",     season: "Vår" },
  { num: 5,  slug: "maj",       short: "Maj", full: "Maj",       season: "Vår" },
  { num: 6,  slug: "juni",      short: "Jun", full: "Juni",      season: "Sommar" },
  { num: 7,  slug: "juli",      short: "Jul", full: "Juli",      season: "Sommar" },
  { num: 8,  slug: "augusti",   short: "Aug", full: "Augusti",   season: "Sommar" },
  { num: 9,  slug: "september", short: "Sep", full: "September", season: "Höst" },
  { num: 10, slug: "oktober",   short: "Okt", full: "Oktober",   season: "Höst" },
  { num: 11, slug: "november",  short: "Nov", full: "November",  season: "Höst" },
  { num: 12, slug: "december",  short: "Dec", full: "December",  season: "Vinter" },
] as const;

export type MonthSlug = (typeof MONTHS)[number]["slug"];

export function monthFromSlug(slug: string) {
  return MONTHS.find((m) => m.slug === slug) ?? null;
}

export function monthFromNum(num: number) {
  return MONTHS.find((m) => m.num === num) ?? null;
}

export const TASK_TYPES = [
  { value: "sowing",       label: "Sådd",        icon: "🌱", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { value: "planting",     label: "Plantering",  icon: "🪴", color: "bg-green-50 border-green-200 text-green-800" },
  { value: "harvest",      label: "Skörd",       icon: "🌾", color: "bg-amber-50 border-amber-200 text-amber-800" },
  { value: "fertilizing",  label: "Gödsling",    icon: "🌿", color: "bg-lime-50 border-lime-200 text-lime-800" },
  { value: "pruning",      label: "Beskärning",  icon: "✂️",  color: "bg-orange-50 border-orange-200 text-orange-800" },
  { value: "frost_warning",label: "Frostvarning",icon: "❄️",  color: "bg-blue-50 border-blue-200 text-blue-800" },
  { value: "seasonal_tip", label: "Säsongstips", icon: "💡", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
] as const;

export type TaskTypeValue = (typeof TASK_TYPES)[number]["value"];

export function getTaskType(value: string | null) {
  return TASK_TYPES.find((t) => t.value === value) ?? {
    value: value ?? "other",
    label: value ?? "Övrigt",
    icon: "📌",
    color: "bg-gray-50 border-gray-200 text-gray-700",
  };
}

export const GROWING_ZONES = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const GROWING_TYPES = [
  { value: "garden",     label: "🌳 Trädgård" },
  { value: "balcony",    label: "🪴 Balkong" },
  { value: "greenhouse", label: "🏡 Växthus" },
  { value: "indoor",     label: "🪟 Inomhus" },
  { value: "allotment",  label: "🌱 Kolonilott" },
];

export const PLANT_CATEGORIES = [
  "Grönsaker", "Rotfrukter", "Örter", "Frukt", "Bär",
  "Blommor", "Lök & vitlök", "Baljväxter", "Sallad & bladgrönt",
];

export const SEASON_COLORS: Record<string, string> = {
  Vinter: "from-blue-50 to-slate-50",
  Vår:    "from-green-50 to-emerald-50",
  Sommar: "from-amber-50 to-yellow-50",
  Höst:   "from-orange-50 to-amber-50",
};
