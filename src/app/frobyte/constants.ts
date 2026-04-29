export const EXCHANGE_TYPES = [
  { value: "trade",  label: "Byta",         emoji: "🔄", color: "blue",   description: "Byta mot annat" },
  { value: "give",   label: "Ge bort",       emoji: "🎁", color: "green",  description: "Gratis, ingen motprestation" },
  { value: "sell",   label: "Sälja",         emoji: "💰", color: "amber",  description: "Mot betalning" },
  { value: "wanted", label: "Sökes",         emoji: "🔍", color: "purple", description: "Letar efter" },
] as const;

export const CATEGORIES = [
  { value: "Frön",       emoji: "🫘" },
  { value: "Plantor",    emoji: "🌱" },
  { value: "Sticklingar",emoji: "✂️" },
  { value: "Verktyg",   emoji: "🔧" },
  { value: "Tillbehör", emoji: "📦" },
] as const;

export const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  active:   { label: "Aktiv",      cls: "bg-green-100 text-green-700" },
  reserved: { label: "Reserverad", cls: "bg-amber-100 text-amber-700" },
  closed:   { label: "Avslutad",   cls: "bg-gray-100 text-gray-500"  },
};
