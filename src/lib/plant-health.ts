// Delade konstanter för växtidentifiering och -diagnos

export const HEALTH_SYMPTOMS = [
  { key: "yellow_leaves",   label: "Gula blad",         emoji: "🍋" },
  { key: "brown_spots",     label: "Bruna fläckar",     emoji: "🟤" },
  { key: "holes_in_leaves", label: "Hål i blad",        emoji: "🕳️" },
  { key: "drooping",        label: "Slokande blad",     emoji: "😔" },
  { key: "white_spots",     label: "Vita fläckar",      emoji: "⚪" },
  { key: "black_spots",     label: "Svarta prickar",    emoji: "⚫" },
  { key: "sticky_leaves",   label: "Kladdiga blad",     emoji: "🫧" },
  { key: "dry_edges",       label: "Torra bladkanter",  emoji: "🏜️" },
  { key: "slow_growth",     label: "Växer långsamt",    emoji: "🐌" },
  { key: "visible_pests",   label: "Ohyra synlig",      emoji: "🐛" },
] as const;

export const HEALTH_PROBLEM_TYPES = [
  { key: "too_little_water",    label: "För lite vatten",   emoji: "🏜️" },
  { key: "too_much_water",      label: "För mycket vatten", emoji: "💧" },
  { key: "nutrient_deficiency", label: "Näringsbrist",      emoji: "🍂" },
  { key: "pests",               label: "Skadedjur",         emoji: "🐛" },
  { key: "disease",             label: "Sjukdom",           emoji: "🦠" },
  { key: "sun_damage",          label: "Solskada",          emoji: "☀️" },
  { key: "frost_damage",        label: "Frostskada",        emoji: "❄️" },
  { key: "poor_soil",           label: "Dålig jord",        emoji: "🪨" },
  { key: "root_problem",        label: "Rotproblem",        emoji: "🌿" },
] as const;

export type SymptomKey     = typeof HEALTH_SYMPTOMS[number]["key"];
export type ProblemTypeKey = typeof HEALTH_PROBLEM_TYPES[number]["key"];

/** Gemensam produkt-/guide-typ som används i resultat */
export interface RelatedGuide {
  id:       string;
  title:    string;
  slug:     string;
  imageUrl: string | null;
}

export interface RelatedProduct {
  id:       string;
  name:     string;
  slug:     string;
  imageUrl: string | null;
  price:    number;
}
