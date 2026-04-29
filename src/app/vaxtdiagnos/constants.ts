export const PROBLEM_TYPES = [
  { value: "too_little_water",    label: "För lite vatten",  emoji: "🏜️", color: "orange",  description: "Hängiga, bruna bladkanter, torr jord" },
  { value: "too_much_water",      label: "För mycket vatten", emoji: "💧", color: "blue",    description: "Gul jord, rötröta, svampigt" },
  { value: "nutrient_deficiency", label: "Näringsbrist",     emoji: "🍂", color: "yellow",  description: "Gulnande, bleka eller missfärgade blad" },
  { value: "pests",               label: "Ohyra",            emoji: "🐛", color: "red",     description: "Synliga insekter, hål i blad, klibbighet" },
  { value: "disease",             label: "Sjukdom",          emoji: "🦠", color: "purple",  description: "Mögel, fläckar, vissning utan torka" },
  { value: "sun_damage",          label: "Solskada",         emoji: "☀️", color: "amber",   description: "Brända, bleka eller missfärgade blad" },
  { value: "unknown",             label: "Vet inte",         emoji: "❓", color: "gray",    description: "Jag vet inte vad problemet är" },
] as const;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:      { label: "Öppen",     color: "blue" },
  diagnosed: { label: "Diagnos",   color: "amber" },
  resolved:  { label: "Löst",      color: "green" },
};

export type ProblemTypeValue = typeof PROBLEM_TYPES[number]["value"];
