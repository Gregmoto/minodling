/**
 * Skickar push-notiser via Apple Push Notification service.
 *
 * Implementerad med Web Crypto och fetch i stället för ett Node-bibliotek,
 * eftersom sajten körs på Cloudflare Workers där `node-apn` och liknande
 * inte fungerar.
 *
 * Kräver dessa secrets:
 *   APNS_KEY_ID      – nyckel-ID för .p8-nyckeln (10 tecken)
 *   APNS_TEAM_ID     – Apple Developer Team ID (10 tecken)
 *   APNS_PRIVATE_KEY – innehållet i .p8-filen, inklusive BEGIN/END-raderna
 *   APNS_BUNDLE_ID   – t.ex. se.minodling.app
 *   APNS_PRODUCTION  – "true" i skarpt läge, annars används sandbox
 */

interface ApnsConfig {
  keyId: string;
  teamId: string;
  privateKey: string;
  bundleId: string;
  production: boolean;
}

export interface PushMessage {
  title: string;
  body: string;
  /** Sökväg som öppnas när användaren trycker på notisen, t.ex. "/paminnelser". */
  link?: string;
  badge?: number;
  /** Grupperar notiser i notiscentret. */
  threadId?: string;
}

export interface PushResult {
  token: string;
  ok: boolean;
  status: number;
  /** Sant när APNs säger att token är ogiltig och bör raderas. */
  unregistered: boolean;
  reason?: string;
}

function readConfig(): ApnsConfig | null {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = process.env.APNS_PRIVATE_KEY;
  const bundleId = process.env.APNS_BUNDLE_ID;
  if (!keyId || !teamId || !privateKey || !bundleId) return null;
  return {
    keyId,
    teamId,
    privateKey,
    bundleId,
    production: process.env.APNS_PRODUCTION === "true",
  };
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Plockar ut DER-bytena ur en PEM-kodad PKCS#8-nyckel. */
function pemToPkcs8(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// APNs tillåter samma token i upp till en timme. Vi cachar i 50 minuter
// och undviker därmed att signera om vid varje notis.
let cachedToken: { value: string; expires: number } | null = null;

async function authToken(cfg: ApnsConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expires > now) return cachedToken.value;

  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: "ES256", kid: cfg.keyId })),
  );
  const payload = base64url(
    new TextEncoder().encode(JSON.stringify({ iss: cfg.teamId, iat: now })),
  );
  const signingInput = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(cfg.privateKey) as unknown as ArrayBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );

  const jwt = `${signingInput}.${base64url(signature)}`;
  cachedToken = { value: jwt, expires: now + 50 * 60 };
  return jwt;
}

/**
 * Skickar en notis till en enhet.
 *
 * Returnerar alltid ett resultat i stället för att kasta – anroparen ska
 * kunna skicka till många enheter utan att ett fel stoppar resten.
 */
export async function sendPush(deviceToken: string, msg: PushMessage): Promise<PushResult> {
  const cfg = readConfig();
  if (!cfg) {
    return { token: deviceToken, ok: false, status: 0, unregistered: false,
             reason: "APNs är inte konfigurerat" };
  }

  const host = cfg.production ? "api.push.apple.com" : "api.sandbox.push.apple.com";
  const body = {
    aps: {
      alert: { title: msg.title, body: msg.body },
      sound: "default",
      ...(msg.badge !== undefined ? { badge: msg.badge } : {}),
      ...(msg.threadId ? { "thread-id": msg.threadId } : {}),
    },
    ...(msg.link ? { link: msg.link } : {}),
  };

  try {
    const jwt = await authToken(cfg);
    const res = await fetch(`https://${host}/3/device/${deviceToken}`, {
      method: "POST",
      headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": cfg.bundleId,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return { token: deviceToken, ok: true, status: res.status, unregistered: false };
    }

    let reason = `HTTP ${res.status}`;
    try {
      const err = (await res.json()) as { reason?: string };
      if (err.reason) reason = err.reason;
    } catch { /* tomt svar */ }

    // 410 Gone, eller BadDeviceToken, betyder att enheten inte längre finns.
    const unregistered =
      res.status === 410 || reason === "BadDeviceToken" || reason === "Unregistered";

    return { token: deviceToken, ok: false, status: res.status, unregistered, reason };
  } catch (e) {
    return { token: deviceToken, ok: false, status: 0, unregistered: false,
             reason: (e as Error).message };
  }
}

/** Skickar samma notis till flera enheter. */
export async function sendPushToMany(
  tokens: string[],
  msg: PushMessage,
): Promise<PushResult[]> {
  return Promise.all(tokens.map((t) => sendPush(t, msg)));
}

export function isApnsConfigured(): boolean {
  return readConfig() !== null;
}
