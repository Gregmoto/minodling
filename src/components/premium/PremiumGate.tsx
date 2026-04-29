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

export function PremiumGate({
  isPremium,
  children,
  showChildren = false,
  featureName,
}: PremiumGateProps) {
  if (isPremium) return <>{children}</>;

  return (
    <div className="relative rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      {showChildren && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-30 blur-[2px]">
          {children}
        </div>
      )}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
          <Lock className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {featureName ? `${featureName} kräver Premium` : "Kräver Premium"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Den här funktionen är tillgänglig för premium-prenumeranter.
          </p>
        </div>
        <Link href="/premium"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors">
          <Crown className="h-4 w-4" />
          Läs mer om Premium
        </Link>
      </div>
    </div>
  );
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
