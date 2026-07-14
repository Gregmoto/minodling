# Migrationsplan: Vercel → Cloudflare Workers

Mål: flytta minodling från Vercel till Cloudflare (Workers) för att samla all infrastruktur
på ett ställe. Stack: Next.js 15 App Router, Prisma + Supabase (Postgres), Stripe, Supabase Auth.

Vald DB-väg: **Cloudflare Hyperdrive** (Postgres-pooling vid edge).
Adapter: **OpenNext Cloudflare** (`@opennextjs/cloudflare`) — kör Next.js på Workers med `nodejs_compat`.

> Görs på en egen branch. Vercel-setupen rörs inte förrän Cloudflare-versionen är verifierad,
> så flytten går att avbryta när som helst.

---

## 0. Förutsättningar (engångskontroll)

- [ ] **Cloudflare Workers Paid-plan** ($5/mån). Behövs för bundle-storlek (Next + Prisma är
      större än gratisgränsen 3 MB) och för Hyperdrive. Ersätter Vercel-kostnaden.
- [ ] Supabase-projektets **direkta** Postgres-connection string (inte poolern) — Hyperdrive
      poolar själv. Finns i Supabase → Database → Connection string → "Direct connection".
- [ ] `wrangler` inloggad mot rätt Cloudflare-konto (`npx wrangler login`).
- [ ] Domänen ligger redan på Cloudflare (bekräftat) → Workers custom domain kan användas.

---

## 1. Installera adapter och verktyg

```bash
npm i -D @opennextjs/cloudflare wrangler
npm i @prisma/adapter-pg pg
npm i -D @types/pg
```

Nya scripts i `package.json`:

```jsonc
"scripts": {
  "cf:build":   "prisma generate && opennextjs-cloudflare build",
  "cf:preview": "opennextjs-cloudflare preview",   // lokal Workers-runtime
  "cf:deploy":  "opennextjs-cloudflare deploy"
}
```

---

## 2. Wrangler-konfiguration (`wrangler.jsonc`)

```jsonc
{
  "name": "minodling",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },

  // Inkrementell cache (ISR/SSG) – odlingskalender m.fl.
  "r2_buckets": [
    { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "minodling-inc-cache" }
  ],

  // Tag-cache för revalidatePath / revalidateTag("settings")
  "kv_namespaces": [
    { "binding": "NEXT_TAG_CACHE_KV", "id": "<skapas med wrangler>" }
  ],

  // Databas via Hyperdrive
  "hyperdrive": [
    { "binding": "HYPERDRIVE", "id": "<hyperdrive-config-id>" }
  ]
}
```

Skapa resurserna:

```bash
npx wrangler r2 bucket create minodling-inc-cache
npx wrangler kv namespace create NEXT_TAG_CACHE_KV
npx wrangler hyperdrive create minodling-db \
  --connection-string="postgres://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres"
```

`open-next.config.ts`:

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import kvTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: kvTagCache,
});
```

---

## 3. Prisma mot Hyperdrive (största kodändringen)

Problemet: `src/lib/prisma.ts` är en **modulnivå-singleton**. På Workers finns Hyperdrive-
anslutningen bara **per request** (via bindningen `env.HYPERDRIVE`), inte vid import. Därför
måste klienten byggas lazily utifrån request-kontexten.

**3a. Schema** — aktivera driver-adaptern (`prisma/schema.prisma`):

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

**3b. Refaktorera `src/lib/prisma.ts`** till en per-request-factory:

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// I dev (Node) finns ingen Hyperdrive-bindning → fall tillbaka på DATABASE_URL.
function connectionString(): string {
  try {
    const { env } = getCloudflareContext();
    // @ts-expect-error binding-typ
    if (env?.HYPERDRIVE?.connectionString) return env.HYPERDRIVE.connectionString;
  } catch { /* utanför Workers */ }
  return process.env.DATABASE_URL!;
}

function build(): PrismaClient {
  const pool = new Pool({ connectionString: connectionString() });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

// Cachas per request på Workers (globalThis nollställs mellan requests där),
// och som vanlig singleton i dev.
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? build();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
export default prisma;
```

> Alla ~380 filer importerar `@/lib/prisma` oförändrat (`import prisma from "@/lib/prisma"`),
> så inga call-sites behöver röras — bara den här filen. **Verifiera** dock att den lata
> globalen fungerar mot OpenNext:s request-modell; om Hyperdrive-bindningen inte hinner in
> byts `export const prisma` mot en `getPrisma()`-funktion (då krävs sök/ersätt i call-sites).

**3c.** `serverExternalPackages: ["@prisma/client"]` i `next.config.ts` — behåll. Med driver-
adaptern behövs ingen Rust-engine-binär (JS-adaptern sköter queryn), vilket är det som gör
Prisma Workers-kompatibelt.

---

## 4. Bildoptimering

Vercel optimerar `next/image` gratis och automatiskt; Cloudflare gör det inte. Tre val:

- **A (billigast, rekommenderas att börja med):** låt Supabase transformera bilderna. Sätt en
  custom loader som pekar på Supabases render-endpoint (`/storage/v1/render/image/public/...`
  med `width`/`quality`). Kräver Supabase Pro (som du sannolikt redan har).
- **B:** `images: { unoptimized: true }` — enklast, men originalbilder serveras (större).
- **C:** Cloudflare Images (betaltjänst) via loader — bäst kvalitet, extra kostnad.

Åtgärd: lägg `images.loader = "custom"` + `loaderFile` i `next.config.ts` (alt. A/C) eller
`unoptimized` (alt. B). `remotePatterns` för `*.supabase.co` behålls.

---

## 5. Analytics (byt ut Vercel)

- Ta bort `@vercel/analytics` och `src/components/analytics/ConsentedAnalytics.tsx`.
- Lägg in **Cloudflare Web Analytics** (cookieless) — passar consent-modellen. Beacon-scriptet
  läggs bakom samma statistik-samtycke som GA i `AnalyticsScripts.tsx`.
- `@vercel/analytics` tas bort ur `package.json`.

---

## 6. Miljövariabler / secrets

Flytta till Cloudflare (dashboard eller `wrangler secret put`):

```bash
npx wrangler secret put DIRECT_URL
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY        # + ev. service role
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
# ...alla nuvarande Vercel-env
```

- `DATABASE_URL` behövs **inte** i runtime på Workers (Hyperdrive-bindningen ersätter den),
  men `DIRECT_URL` behövs fortfarande för `prisma migrate` från din maskin/CI.
- `NEXT_PUBLIC_*` sätts som vanliga vars (byggs in vid build).

---

## 7. Stripe-webhook

- Endpoint körs på `runtime = "nodejs"` och läser rå body via `req.text()` → fungerar på
  Workers med `nodejs_compat`.
- Efter deploy: peka om webhook-URL:en i Stripe-dashboarden till
  `https://<domän>/api/stripe/webhook`. Signatur-secreten är oförändrad.

---

## 8. Deploy & domän

```bash
npm run cf:build
npm run cf:preview          # testa lokalt i Workers-runtime FÖRST
npm run cf:deploy           # deployar till *.workers.dev
```

- Koppla custom domain i Cloudflare → Workers & Pages → din worker → Custom Domains.
- Behåll `*.workers.dev`-URL:en för att testa innan DNS pekas om.

---

## 9. Testchecklista (innan DNS pekas om)

- [ ] Startsida + en SSG-sida (`/odlingskalender/juli`) renderar
- [ ] Inloggning (Supabase auth) + skyddad route (`/dashboard`) fungerar
- [ ] En server action som skriver till DB (skapa påminnelse) → verifiera i Supabase
- [ ] DB-läsning under last (forum-listan) via Hyperdrive
- [ ] `next/image` visar Supabase-bilder korrekt (vald loader)
- [ ] `revalidatePath` slår igenom (skapa foruminlägg → syns i listan)
- [ ] Stripe-webhook: `stripe listen --forward-to <domän>/api/stripe/webhook` + testorder
- [ ] `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/apple-touch-icon.png`
- [ ] Cookie-consent + analytics laddas bara efter samtycke
- [ ] 404/500 (root `error.tsx`) renderar

---

## 10. Avveckla Vercel (sista steget)

- [ ] Peka domänens DNS mot Cloudflare Worker.
- [ ] Övervaka Workers-loggar + Supabase-anslutningar ett par dagar.
- [ ] Pausa/ta bort Vercel-projektet när allt är stabilt.

---

## Kända risker / öppna punkter

1. **Prisma-singleton vs per-request-bindning** (steg 3b) — måste verifieras tidigt. Om den
   lata globalen inte får Hyperdrive-bindningen krävs `getPrisma()`-refaktor i call-sites.
2. **Bundle-storlek** på Workers — Next + Prisma kan slå i gränsen; Paid-plan ger 10 MB
   gzippad, vilket normalt räcker. Mäts vid första `cf:build`.
3. **Bildoptimering** — alt. A (Supabase render) beror på Supabase-plan; annars alt. B/C.
4. **Kall-start + Hyperdrive-cache** — första anropen kan vara långsammare tills poolen är varm.

## Grov tidsåtgång
Uppsättning + lokal verifiering: ~½–1 dag. Plus buffert för Prisma-bindningen och bild-loadern,
som är de två ställen som oftast kräver justering.
