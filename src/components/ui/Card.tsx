import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

// ── Typer ─────────────────────────────────────────────────────────

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visuell variant */
  variant?: "default" | "flat" | "outlined" | "green" | "harvest";
  /** Interaktivt kort med hover-effekt */
  hover?: boolean;
  /** Inre padding */
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

// ── Stilmap ───────────────────────────────────────────────────────

const variantStyles: Record<NonNullable<CardProps["variant"]>, string> = {
  default:  "bg-white border border-sage-100 shadow-card",
  flat:     "bg-white border border-sage-100",
  outlined: "bg-transparent border-2 border-sage-200",
  green:    "bg-green-50 border border-green-100",
  harvest:  "bg-harvest-50 border border-harvest-100",
};

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  xs:   "p-3",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
  xl:   "p-8",
};

// ── Komponent ─────────────────────────────────────────────────────

export function Card({
  className,
  variant = "default",
  hover   = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variantStyles[variant],
        hover && "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Sub-komponenter ───────────────────────────────────────────────

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold text-lg leading-tight text-gray-900 tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-gray-500 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-gray-600", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-sage-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}
