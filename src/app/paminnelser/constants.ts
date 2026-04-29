// Påminnelsetyper och upprepningsalternativ – delas av actions och UI-komponenter
export const REMINDER_TYPES = [
  { value: "watering",    label: "Vattning",    emoji: "💧", color: "sky" },
  { value: "fertilizing", label: "Gödsling",    emoji: "🌿", color: "emerald" },
  { value: "repotting",   label: "Omskolning",  emoji: "🪴", color: "green" },
  { value: "planting",    label: "Plantering",  emoji: "🌱", color: "lime" },
  { value: "harvest",     label: "Skörd",       emoji: "🌾", color: "amber" },
  { value: "pruning",     label: "Beskärning",  emoji: "✂️", color: "orange" },
  { value: "frost",       label: "Frost",       emoji: "❄️", color: "blue" },
  { value: "sowing",      label: "Ny sådd",     emoji: "🫘", color: "teal" },
] as const;

export const REPEAT_OPTIONS = [
  { value: "none",      label: "Ingen upprepning", days: 0 },
  { value: "daily",     label: "Varje dag",         days: 1 },
  { value: "weekly",    label: "Varje vecka",        days: 7 },
  { value: "biweekly",  label: "Var 14:e dag",       days: 14 },
  { value: "monthly",   label: "Varje månad",        days: 30 },
  { value: "yearly",    label: "Varje år",           days: 365 },
] as const;
