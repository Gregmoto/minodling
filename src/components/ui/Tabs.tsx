"use client";

import { createContext, useContext, useState, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ── Kontext ───────────────────────────────────────────────────────

interface TabsContextValue {
  value:    string;
  onChange: (v: string) => void;
  variant:  "underline" | "pills" | "solid";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs-komponenter måste wrappas i <Tabs>");
  return ctx;
}

// ── Typer ─────────────────────────────────────────────────────────

interface TabsProps {
  /** Aktivt flik-värde (controlled) */
  value?:         string;
  /** Standardvärde (uncontrolled) */
  defaultValue?:  string;
  onValueChange?: (v: string) => void;
  /** Visuell stil */
  variant?:       "underline" | "pills" | "solid";
  children:       ReactNode;
  className?:     string;
}

// ── Tabs (root) ───────────────────────────────────────────────────

export function Tabs({
  value,
  defaultValue = "",
  onValueChange,
  variant  = "underline",
  children,
  className,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;

  function handleChange(v: string) {
    if (!value) setInternal(v);
    onValueChange?.(v);
  }

  return (
    <TabsContext.Provider value={{ value: active, onChange: handleChange, variant }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ── TabsList ──────────────────────────────────────────────────────

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean;
}

export function TabsList({ className, fullWidth = false, children, ...props }: TabsListProps) {
  const { variant } = useTabsContext();

  const listStyles = {
    underline: "border-b border-gray-200 gap-0",
    pills:     "bg-sage-50 p-1 rounded-xl gap-1",
    solid:     "bg-gray-100 p-1 rounded-xl gap-1",
  };

  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center",
        listStyles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── TabsTrigger ───────────────────────────────────────────────────

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value:    string;
  disabled?: boolean;
  /** Ikon till vänster om texten */
  icon?:    ReactNode;
  /** Badge / count till höger */
  badge?:   ReactNode;
}

export function TabsTrigger({
  value,
  disabled = false,
  icon,
  badge,
  children,
  className,
  ...props
}: TabsTriggerProps) {
  const { value: active, onChange, variant } = useTabsContext();
  const isActive = active === value;

  const triggerStyles: Record<TabsContextValue["variant"], { base: string; active: string; inactive: string }> = {
    underline: {
      base:     "relative px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2",
      active:   "border-green-500 text-green-700",
      inactive: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
    },
    pills: {
      base:     "flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
      active:   "bg-white text-green-700 shadow-xs",
      inactive: "text-gray-500 hover:text-gray-700 hover:bg-white/60",
    },
    solid: {
      base:     "flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
      active:   "bg-white text-gray-900 shadow-xs",
      inactive: "text-gray-500 hover:text-gray-700",
    },
  };

  const styles = triggerStyles[variant];

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && onChange(value)}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 rounded",
        "disabled:pointer-events-none disabled:opacity-40",
        styles.base,
        isActive ? styles.active : styles.inactive,
        className,
      )}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon && <span className="text-current opacity-70 flex-shrink-0">{icon}</span>}
      {children}
      {badge && (
        <span className="ml-0.5 text-[10px] font-semibold bg-current/10 rounded-full px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

// ── TabsContent ───────────────────────────────────────────────────

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("animate-fade-in focus-visible:outline-none", className)}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}
