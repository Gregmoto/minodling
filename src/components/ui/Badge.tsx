import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

// ── Typer ─────────────────────────────────────────────────────────

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "premium"
    | "outline"
    | "harvest"
    | "info"
    // Svårighetsgrader
    | "easy"
    | "medium"
    | "hard";
  size?: "xs" | "sm" | "md" | "lg";
  /** Visa en liten punkt före texten */
  dot?: boolean;
}

// ── Stilmap ───────────────────────────────────────────────────────

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  // Generella
  default:  "bg-sage-100 text-sage-700",
  success:  "bg-green-100 text-green-700",
  warning:  "bg-amber-100 text-amber-700",
  danger:   "bg-red-100 text-red-600",
  info:     "bg-blue-100 text-blue-700",
  outline:  "border border-sage-200 text-sage-600 bg-transparent",
  harvest:  "bg-harvest-100 text-harvest-700",
  premium:  "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm",

  // Svårighetsgrader (odlings- och utmaningskontext)
  easy:   "bg-green-100 text-green-700",   // Lätt – grön
  medium: "bg-amber-100 text-amber-700",   // Medel – orange
  hard:   "bg-red-100   text-red-700",     // Svår – röd
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  xs: "px-1.5 py-0 text-[10px] leading-5",
  sm: "px-2   py-0.5 text-xs",
  md: "px-2.5 py-1   text-sm",
  lg: "px-3   py-1   text-sm font-semibold",
};

const dotColors: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-sage-400",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  info:    "bg-blue-500",
  outline: "bg-sage-400",
  harvest: "bg-harvest-500",
  premium: "bg-white",
  easy:    "bg-green-500",
  medium:  "bg-amber-500",
  hard:    "bg-red-500",
};

// ── Komponent ─────────────────────────────────────────────────────

export function Badge({
  className,
  variant = "default",
  size    = "sm",
  dot     = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dotColors[variant])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

// ── Svårighetsgrads-hjälpare ──────────────────────────────────────

export const DIFFICULTY_LABELS = {
  easy:   "Lätt",
  medium: "Medel",
  hard:   "Svår",
} as const;

export type Difficulty = keyof typeof DIFFICULTY_LABELS;

export function DifficultyBadge({
  difficulty,
  size = "sm",
  className,
}: {
  difficulty: Difficulty;
  size?: BadgeProps["size"];
  className?: string;
}) {
  return (
    <Badge variant={difficulty} size={size} dot className={className}>
      {DIFFICULTY_LABELS[difficulty]}
    </Badge>
  );
}
