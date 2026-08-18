# Migration: Vercel → Cloudflare Workers

Status: **förberedelserna är klara och verifierade.** Koden kör i båda runtimes
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
