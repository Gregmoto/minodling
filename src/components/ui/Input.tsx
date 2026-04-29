"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react";

// ── Typer ─────────────────────────────────────────────────────────

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?:     string;
  error?:     string;
  hint?:      string;
  size?:      "sm" | "md" | "lg";
  /** Ikon eller element till vänster inuti fältet */
  leftIcon?:  ReactNode;
  /** Ikon eller element till höger inuti fältet */
  rightIcon?: ReactNode;
  /** Wrapper-klass */
  wrapperClassName?: string;
}

// ── Stilmap ───────────────────────────────────────────────────────

const sizeStyles = {
  sm: { input: "h-8  text-xs   px-3",   padLeft: "pl-8",  padRight: "pr-8",  iconOffset: "left-2.5",  iconOffsetR: "right-2.5"  },
  md: { input: "h-10 text-sm   px-3.5", padLeft: "pl-9",  padRight: "pr-9",  iconOffset: "left-3",    iconOffsetR: "right-3"    },
  lg: { input: "h-12 text-base px-4",   padLeft: "pl-11", padRight: "pr-11", iconOffset: "left-3.5",  iconOffsetR: "right-3.5"  },
};

// ── Komponent ─────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      hint,
      size      = "md",
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const sz      = sizeStyles[size];

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center",
              sz.iconOffset,
            )}>
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-white",
              "placeholder:text-gray-400 transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              error
                ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                : "border-sage-200 hover:border-sage-300",
              sz.input,
              leftIcon  && sz.padLeft,
              rightIcon && sz.padRight,
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400 flex items-center",
              sz.iconOffsetR,
            )}>
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
