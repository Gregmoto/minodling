/**
 * Minodling UI-komponentbibliotek
 *
 * Importera komponenter direkt härifrån:
 *   import { Button, Card, Badge } from "@/components/ui";
 *
 * Designsystem:
 *   - Primärfärg:  green-500 (#4f8f4e)
 *   - Accent:      harvest-500 (#f47220)
 *   - Bakgrund:    cream-50 (#F8F9F7)
 *   - Text:        gray-900 (#222)
 *   - Knappar:     pill-style (rounded-full)
 *   - Cards:       rounded-2xl (16px) + shadow-card
 */

// ── Primitiver ────────────────────────────────────────────────────
export { default as Button }         from "./Button";
export type { ButtonProps }          from "./Button";

export { Badge, DifficultyBadge }    from "./Badge";
export type { BadgeProps, Difficulty } from "./Badge";
export { DIFFICULTY_LABELS }         from "./Badge";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
export type { CardProps }            from "./Card";

export { default as Input }          from "./Input";
export type { InputProps }           from "./Input";

export { default as Select }         from "./Select";
export type { SelectProps }          from "./Select";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

export { Avatar }                    from "./Avatar";
export { Spinner }                   from "./Spinner";

// Textarea re-exporteras om den finns
export { default as Textarea }       from "./Textarea";

// Scrollbara komponenter
export { CategoryScroller }          from "./CategoryScroller";
export type { Category }             from "./CategoryScroller";

export { ScrollableTabs, PLANT_DETAIL_TABS } from "./ScrollableTabs";
export type { TabItem }              from "./ScrollableTabs";

export { ImageInput }                from "./ImageInput";
export type { ImageInputProps }      from "./ImageInput";
