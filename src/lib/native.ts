/**
 * Hjälpare för att köra samma webbapp både i webbläsaren och i iOS-appen.
 *
 * Allt här är klientkod och måste tåla att Capacitor inte finns – på webben
 * returnerar funktionerna tomma värden i stället för att krascha.
 */

export type NativePlatform = "ios" | "android" | "web";

/** Körs vi i app-skalet eller i en vanlig webbläsare? */
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function nativePlatform(): NativePlatform {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

/**
 * Laddar en Capacitor-plugin först när den faktiskt behövs.
 *
 * Dynamisk import gör att webbygget inte drar in native-koden, och att
 * ett saknat plugin ger null i stället för ett kraschande bygge.
 */
async function plugin<T>(loader: () => Promise<T>): Promise<T | null> {
  if (!isNative()) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}

// ── Push-notiser ────────────────────────────────────────────────────────

export interface PushRegistration {
  token: string;
  platform: NativePlatform;
}

/**
 * Ber om tillstånd och registrerar enheten hos APNs.
 * Returnerar enhetstoken, eller null om användaren nekade.
 */
export async function registerForPush(): Promise<PushRegistration | null> {
  const mod = await plugin(() => import("@capacitor/push-notifications"));
  if (!mod) return null;
  const { PushNotifications } = mod;

  let status = await PushNotifications.checkPermissions();
  if (status.receive === "prompt" || status.receive === "prompt-with-rationale") {
    status = await PushNotifications.requestPermissions();
  }
  if (status.receive !== "granted") return null;

  return new Promise((resolve) => {
    // Timeout så att anroparen inte hänger om APNs aldrig svarar.
    const timer = setTimeout(() => resolve(null), 10_000);

    PushNotifications.addListener("registration", (token) => {
      clearTimeout(timer);
      resolve({ token: token.value, platform: nativePlatform() });
    });
    PushNotifications.addListener("registrationError", () => {
      clearTimeout(timer);
      resolve(null);
    });
    void PushNotifications.register();
  });
}

/** Kopplar en callback till att användaren trycker på en notis. */
export async function onPushTap(handler: (link: string) => void): Promise<void> {
  const mod = await plugin(() => import("@capacitor/push-notifications"));
  if (!mod) return;
  await mod.PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const link = action.notification.data?.link;
    if (typeof link === "string" && link.startsWith("/")) handler(link);
  });
}

// ── Kamera ──────────────────────────────────────────────────────────────

/**
 * Tar ett foto eller väljer ur biblioteket och returnerar en data-URL,
 * i samma format som ett <input type="file"> skulle ge via FileReader.
 */
export async function takePhoto(source: "camera" | "photos" = "camera"): Promise<string | null> {
  const mod = await plugin(() => import("@capacitor/camera"));
  if (!mod) return null;
  const { Camera, CameraResultType, CameraSource } = mod;
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
      promptLabelHeader: "Växtbild",
      promptLabelPhoto: "Välj ur biblioteket",
      promptLabelPicture: "Ta ett foto",
      promptLabelCancel: "Avbryt",
    });
    return photo.dataUrl ?? null;
  } catch {
    return null; // användaren avbröt
  }
}

// ── Offline-lagring ─────────────────────────────────────────────────────

/** Sparar värde lokalt på enheten (överlever omstart av appen). */
export async function cacheSet(key: string, value: unknown): Promise<void> {
  const mod = await plugin(() => import("@capacitor/preferences"));
  if (!mod) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* full eller blockerad */ }
    return;
  }
  await mod.Preferences.set({ key, value: JSON.stringify(value) });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const mod = await plugin(() => import("@capacitor/preferences"));
  try {
    const raw = mod
      ? (await mod.Preferences.get({ key })).value
      : localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// ── Nätverk ─────────────────────────────────────────────────────────────

export async function isOnline(): Promise<boolean> {
  const mod = await plugin(() => import("@capacitor/network"));
  if (!mod) return typeof navigator === "undefined" ? true : navigator.onLine;
  return (await mod.Network.getStatus()).connected;
}
