import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

// ── Typer ─────────────────────────────────────────────────────────

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?:            string;
  error?:            string;
  hint?:             string;
  size?:             "sm" | "md" | "lg";
  wrapperClassName?: string;
  placeholder?:      string;
}

// ── Stilmap ───────────────────────────────────────────────────────

const sizeStyles = {
  sm: "h-8  text-xs   pl-3   pr-8",
  md: "h-10 text-sm   pl-3.5 pr-9",
  lg: "h-12 text-base pl-4   pr-10",
};

const iconSizes = {
  sm: "h-3.5 w-3.5 right-2.5",
  md: "h-4   w-4   right-3",
  lg: "h-5   w-5   right-3.5",
};

// ── Komponent ─────────────────────────────────────────────────────

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      hint,
      size        = "md",
      placeholder,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full appearance-none rounded-xl border bg-white",
              "text-gray-900 transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              error
                ? "border-red-400 focus-visible:ring-red-400"
                : "border-sage-200 hover:border-sage-300",
              sizeStyles[size],
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Chevron-ikon */}
          <ChevronDown
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
              iconSizes[size],
            )}
          />
        </div>

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
