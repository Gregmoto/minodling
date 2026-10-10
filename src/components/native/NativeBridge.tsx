"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNative, registerForPush, onPushTap } from "@/lib/native";

/**
 * Kopplar ihop webbappen med iOS-skalet.
 *
 * Monteras i rot-layouten och gör ingenting alls i en vanlig webbläsare –
 * all logik är bakom `isNative()`. Ansvarar för att:
 *
 *  - dölja startskärmen när appen är redo,
 *  - registrera enheten för push och skicka token till servern,
 *  - navigera till rätt sida när användaren trycker på en notis,
 *  - märka <html> med `data-native` så att CSS kan dölja webbspecifik
 *    navigering (t.ex. "installera appen"-banners) inne i appen.
 */
export function NativeBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!isNative()) return;
    let cancelled = false;

    document.documentElement.dataset.native = "ios";

    (async () => {
      // Startskärmen ligger kvar tills appen faktiskt visar innehåll.
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch { /* plugin saknas – strunt samma */ }

      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Light });
      } catch { /* ignorera */ }

      // Notistryck ska öppna rätt sida, t.ex. /paminnelser.
      await onPushTap((link) => router.push(link));

      // Registrera enheten. Misslyckas tyst om användaren nekar notiser –
      // appen ska fungera ändå.
      const reg = await registerForPush();
      if (cancelled || !reg) return;

      try {
        await fetch("/api/push/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reg),
          credentials: "include",
        });
      } catch { /* nätverket nere – försöker igen nästa start */ }
    })();

    return () => { cancelled = true; };
  }, [router]);

  return null;
}
