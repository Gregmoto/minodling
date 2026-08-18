# Migration: Vercel → Cloudflare Workers

Status: **infrastrukturen är uppsatt och deployad. Databaslagret är INTE löst än – se Öppen blockerare.** Koden kör i båda runtimes
samtidigt, så Vercel-deployen är opåverkad tills du själv pekar om DNS.

Adapter: OpenNext (`@opennextjs/cloudflare` 1.20) · DB: Cloudflare Hyperdrive

---

## Verifierat i den här branchen

| Kontroll | Resultat |
|---|---|
| Vercel/Node-bygge | ✅ Fungerar oförändrat |
| Cloudflare Workers-bygge (`npm run cf:build`) | ✅ Lyckas |
| **Bundle-storlek** | **3,9 MB gzippat** (19,6 MB rå) |
| Prisma via lazy Proxy mot riktig DB | ✅ count, findFirst, `$transaction`, `$disconnect` |
| Appen end-to-end lokalt | ✅ 36 växter renderas från DB |
| Bindningar igenkända av wrangler | ✅ KV, Hyperdrive, R2, Assets |

> **Workers Paid ($5/mån) krävs.** 3,9 MB överskrider gratisplanens 3 MB-gräns
> men ryms väl inom betalplanens 10 MB. Det ersätter Vercel-kostnaden.

---

## Vad som redan är gjort i koden

1. **`src/lib/prisma.ts`** – byggd som lat Proxy. På Node används vanlig
   PrismaClient mot `DATABASE_URL`; på Workers används pg-driveradapter mot
   Hyperdrive, vars connection string bara finns i request-kontexten.
   Alla ~380 befintliga `import prisma from "@/lib/prisma"` är oförändrade.
2. **`prisma/schema.prisma`** – `previewFeatures = ["driverAdapters"]`.
3. **`wrangler.jsonc`** – bindningar för Hyperdrive, R2, KV och assets.
4. **`open-next.config.ts`** – R2 för inkrementell cache, KV för tag-cache.
5. **`next.config.ts`** – `images.unoptimized` aktiveras **endast** i
   CF-bygget via `CLOUDFLARE_BUILD=1`. Vercel påverkas inte.
6. **`src/app/apple-touch-icon.png/route.tsx`** – `runtime` edge → nodejs.
   OpenNext stödjer inte inline edge-runtime. Fungerar likadant på Vercel.
7. **Scripts** – `cf:build`, `cf:preview`, `cf:deploy`.

---

## Steg kvar – dessa kräver ditt Cloudflare-konto

Jag har inte tillgång till kontot, så dessa kör du.

### 1. Logga in och aktivera Workers Paid
```bash
npx wrangler login
```
Aktivera Workers Paid i dashboarden (Workers & Pages → Plans).

### 2. Skapa resurserna
```bash
npx wrangler r2 bucket create minodling-inc-cache
npx wrangler kv namespace create NEXT_TAG_CACHE_KV
```
Hyperdrive – använd Supabases **direkta** anslutning (port 5432), inte poolern:
```bash
npx wrangler hyperdrive create minodling-db \
  --connection-string="postgres://postgres:<lösenord>@db.<ref>.supabase.co:5432/postgres"
```

### 3. Klistra in id:na i `wrangler.jsonc`
Ersätt `ERSÄTT_MED_KV_ID` och `ERSÄTT_MED_HYPERDRIVE_ID` med värdena
kommandona skrev ut.

### 4. Lägg in secrets
```bash
npx wrangler secret put DIRECT_URL
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```
Plus övriga variabler ni har i Vercel. `DATABASE_URL` behövs **inte** i runtime
på Workers (Hyperdrive-bindningen ersätter den) men krävs för `prisma migrate`.

### 5. Testa lokalt i Workers-runtime
```bash
npm run cf:preview
```

### 6. Deploya till *.workers.dev
```bash
npm run cf:deploy
```

---

## Testchecklista – innan DNS pekas om

- [ ] Startsida och en SSG-sida (`/odlingskalender/juli`) renderar
- [ ] Inloggning (Supabase) + skyddad route (`/dashboard`)
- [ ] Server action som skriver till DB (skapa påminnelse) → syns i Supabase
- [ ] DB-läsning under last (forum, växtdatabas) via Hyperdrive
- [ ] Bilder visas (observera: ooptimerade på CF, se nedan)
- [ ] `revalidatePath` slår igenom (nytt foruminlägg syns i listan)
- [ ] Stripe: `stripe listen --forward-to <url>/api/stripe/webhook` + testorder
- [ ] `/sitemap.xml`, `/robots.txt`, `/ads.txt`, `/icon.svg`, `/apple-touch-icon.png`
- [ ] AdSense-annonser laddar och Googles CMP visas
- [ ] 404 och root `error.tsx`

---

## Cutover

1. Peka domänens DNS mot Workern (Workers & Pages → Custom Domains).
2. Uppdatera Stripe-webhookens URL till den nya domänen.
3. Byt `@vercel/analytics` mot Cloudflare Web Analytics (cookieless – passar
   consent-modellen bättre). Görs enklast via CF-dashboardens auto-injektion.
4. Övervaka Workers-loggar och Supabase-anslutningar ett par dagar.
5. Pausa Vercel-projektet när allt är stabilt.

---

## Kända avvägningar

**Bildoptimering.** Vercel optimerar `next/image` gratis; Cloudflare gör det
inte. CF-bygget kör därför `unoptimized: true` – originalbilderna serveras,
vilket fungerar men ger mer bandbredd. Två uppgraderingsvägar:
- **Cloudflare Images** (betaltjänst) via custom loader – bäst kvalitet.
- **Supabase image transformations** (kräver Supabase Pro) via custom loader
  mot `/storage/v1/render/image/public/...`.

**Kall start.** Första anropen kan vara långsammare tills Hyperdrives pool är
varm.

**Annonsintäkter.** Sajten tjänar pengar nu. Verifiera hela testchecklistan på
`*.workers.dev` innan DNS byts, så att AdSense inte tappar verifiering.


---

## Öppen blockerare: Prisma mot Workers

Workern är deployad och serverar sidor på https://minodling.omdio.workers.dev,
men **alla databasläsningar misslyckas tyst**. Sidor svarar 200 men renderar
tomma listor eftersom koden har `.catch(() => [])`.

Felet i `wrangler tail`:
```
prisma:error [unenv] fs.readdir is not implemented yet!
```

Prisma försöker ladda sin **binära query-motor**, som inte finns i workerd.
Hyperdrive-bindningen fungerar – verifierat med diagnostiklogg som visade att
connection stringen hittas (182 tecken). Problemet är alltså inte anslutningen
utan hur Prisma-klienten paketeras.

### Vad som redan provats
1. Prisma 5.22 + `driverAdapters` + pg-adapter → samma fel.
2. Uppgradering till Prisma 6.19.3 + `queryCompiler` (tar bort Rust-motorn)
   → samma fel.
3. Extra generator `prisma-client` med `runtime = "workerd"` till
   `src/generated/prisma-workers`, plus webpack-alias i `next.config.ts` som
   pekar om `@prisma/client` när `CLOUDFLARE_BUILD=1` → aliaset får inte fäste
   genom OpenNext-buntningen; samma fel.

### Troliga nästa steg
- Verifiera att aliaset faktiskt tillämpas (inspektera
  `.open-next/server-functions/default/handler.mjs` efter referenser till
  `prisma-workers` respektive `.prisma/client`).
- Alternativt importera den workerd-genererade klienten **direkt** i
  `src/lib/prisma.ts` istället för via alias, och låta Node-bygget använda en
  separat fil (t.ex. via `serverExternalPackages` + villkorad import).
- Kontrollera att WASM-modulen för queryCompiler kommer med i bundlen; workerd
  kräver att `.wasm` importeras som modul.
- Om det låser sig: Prisma Accelerate eller byte till en Workers-native
  klient (t.ex. Kysely eller postgres.js) för de tyngsta läsvägarna.

### Vad som DÄREMOT fungerar på Workers
- Statiska och SSG-renderade sidor (`/`, `/om-oss`, `/integritetspolicy`)
- Assets, `ads.txt`, `icon.svg`, `robots.txt`, `manifest.webmanifest`
- Bindningarna: Hyperdrive, R2-cache, KV-tagcache, Assets
- Bundle 3,9 MB gzippat – ryms i Workers Paid
