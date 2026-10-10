import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Min Odling – iOS-app.
 *
 * Appen laddar den publicerade sajten i en webbvy, eftersom Next.js-appen är
 * server-renderad och inte kan paketeras statiskt. Det native-värde som gör
 * appen till mer än en webbläsare ligger i pluginen nedan: push-notiser för
 * påminnelser, kameraåtkomst för växtidentifiering, lokal lagring för offline
 * och filsystem för dagboksbilder.
 *
 * `www/` innehåller bara en reservsida som visas om sajten inte går att nå.
 */
const config: CapacitorConfig = {
  appId: "se.minodling.app",
  appName: "Min Odling",
  webDir: "www",

  server: {
    url: "https://minodling.se",
    hostname: "minodling.se",
    androidScheme: "https",
    iosScheme: "https",
    // Tillåt navigering inom egna domäner; allt annat öppnas i Safari.
    allowNavigation: ["minodling.se", "www.minodling.se", "*.supabase.co"],
  },

  ios: {
    // Undviker att innehållet hamnar under statusfältet.
    contentInset: "always",
    backgroundColor: "#f7f5ef",
    // Låt länkar till andra domäner öppnas externt i stället för i appen.
    limitsNavigationsToAppBoundDomains: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#1e5450",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f7f5ef",
    },
  },
};

export default config;
