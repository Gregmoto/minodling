"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visuell stil */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "harvest" | "white";
  /** Storlek */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Pill-form (rounded-full). Default: true */
  pill?: boolean;
  /** Visas laddnings-spinner och knappen låses */
  loading?: boolean;
  /** Tar upp full bredd */
  fullWidth?: boolean;
  /** Ikon-knapp (kvadratisk) */
  iconOnly?: boolean;
}

// ── Stilmap ───────────────────────────────────────────────────────

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 " +
    "focus-visible:ring-green-400 shadow-sm hover:shadow-green",
  secondary:
    "bg-green-50 text-green-800 hover:bg-green-100 active:bg-green-200 " +
    "focus-visible:ring-green-300",
  outline:
    "border-2 border-green-500 text-green-700 bg-transparent " +
    "hover:bg-green-50 active:bg-green-100 focus-visible:ring-green-400",
  ghost:
    "text-gray-600 hover:bg-sage-50 active:bg-sage-100 " +
    "focus-visible:ring-sage-300",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 " +
    "focus-visible:ring-red-400 shadow-sm",
  harvest:
    "bg-harvest-500 text-white hover:bg-harvest-600 active:bg-harvest-700 " +
    "focus-visible:ring-harvest-400 shadow-sm hover:shadow-harvest",
  white:
    "bg-white text-gray-700 border border-gray-200 " +
    "hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-300 shadow-xs",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "h-7  px-2.5 text-xs  gap-1",
  sm: "h-8  px-3.5 text-sm  gap-1.5",
  md: "h-10 px-5   text-sm  gap-2",
  lg: "h-12 px-6   text-base gap-2",
  xl: "h-14 px-8   text-base gap-2.5",
};

const iconOnlySizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "h-7  w-7",
  sm: "h-8  w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
};

// ── Komponent ─────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant  = "primary",
      size     = "md",
      pill     = true,
      loading  = false,
      fullWidth = false,
      iconOnly  = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base = [
      "inline-flex items-center justify-center font-medium",
      "transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-[0.97]",
      "select-none",
      pill ? "rounded-pill" : "rounded-xl",
      fullWidth ? "w-full" : "",
      iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
    ].join(" ");

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variantStyles[variant], className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 flex-shrink-0" />
            {!iconOnly && children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
