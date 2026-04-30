/**
 * PremiumGate
 *
 * Wrapper som visar innehåll om användaren är premium,
 * annars visas en "Kräver Premium"-bricka med länk.
 *
 * Används i server components:
 *   <PremiumGate isPremium={isPremium}>
 *     <AdvancedFeature />
 *   </PremiumGate>
 */
import Link from "next/link";
import { Crown, Lock } from "lucide-react";

interface PremiumGateProps {
  isPremium: boolean;
  children: React.ReactNode;
  /**
   * Visa fallback istället för att gömma innehållet helt.
   * Om false döljs children och en CTA visas. Default: false.
   */
  showChildren?: boolean;
  featureName?: string;
}

// TILLFÄLLIGT: PremiumGate är alltid öppen – allt är gratis tills vidare.
export function PremiumGate({
  children,
}: PremiumGateProps) {
  return <>{children}</>;
}

/**
 * Liten inline-bricka att sätta bredvid funktionsnamn i menyer etc.
 */
export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-semibold tracking-wide uppercase ${className}`}>
      <Crown className="h-2.5 w-2.5" />
      Pro
    </span>
  );
}
