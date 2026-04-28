# Minodling.se

Sveriges odlingscommunity – ett fullstack-projekt byggt med Next.js, Supabase och Prisma.

## Tech Stack

| Lager | Teknik |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Språk | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth |
| Databas | PostgreSQL via Supabase |
| ORM | Prisma |
| Bildlagring | Supabase Storage |
| Deployment | Vercel |
| E-post | Resend (förberett) |
| Betalning | Stripe (förberett) |

## Komma igång

### 1. Klona och installera

```bash
git clone https://github.com/ditt-repo/minodling.git
cd minodling
npm install
```

### 2. Miljövariabler

Kopiera `.env.example` till `.env.local` och fyll i dina värden:

```bash
cp .env.example .env.local
```

Nödvändiga variabler:

- `NEXT_PUBLIC_SUPABASE_URL` – från Supabase-projektets inställningar
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon-nyckel från Supabase
- `SUPABASE_SERVICE_ROLE_KEY` – service role-nyckel (används server-side)
- `DATABASE_URL` – Supabase Pooler-URL (med `?pgbouncer=true`)
- `DIRECT_URL` – direkt PostgreSQL-URL (för Prisma-migrationer)

### 3. Sätt upp databasen

```bash
# Generera Prisma-klient
npm run db:generate

# Pusha schemat till Supabase
npm run db:push

# Kör seed-data (kategorier, badges)
npx prisma db seed
```

### 4. Kör Supabase-migrationer

I Supabase-dashboarden → SQL Editor, kör filerna i ordning:

1. `supabase/migrations/20240101_create_profile_trigger.sql`
2. `supabase/migrations/20240102_rls_policies.sql`

### 5. Starta dev-servern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

---

## Projektstruktur

```
src/
├── app/
│   ├── (dashboard)/        # Inloggade sidor (dashboard, min-odling, profil)
│   ├── admin/              # Adminpanel (kräver ADMIN-roll)
│   ├── auth/               # Inloggning, registrering, callback
│   ├── forum/              # Forumssidor
│   ├── api/                # API-routes
│   └── page.tsx            # Startsida
├── components/
│   ├── layout/             # Navbar, Footer
│   └── ui/                 # Återanvändbara UI-komponenter
├── lib/
│   ├── supabase/           # Supabase-klienter (client/server)
│   ├── prisma.ts           # Prisma-singleton
│   ├── utils.ts            # Hjälpfunktioner
│   ├── config.ts           # Sajtkonfiguration
│   └── validations/        # Zod-scheman
├── hooks/                  # React hooks (useUser)
├── types/                  # TypeScript-typer
└── middleware.ts            # Auth-skydd för routes
```

---

## Rollsystem

| Roll | Behörighet |
|------|-----------|
| `USER` | Standard – kan läsa, skriva, kommentera |
| `MODERATOR` | Kan ta bort inlägg/kommentarer |
| `ADMIN` | Full åtkomst + adminpanel |

Tilldela admin-roll via SQL:
```sql
UPDATE profiles SET role = 'ADMIN' WHERE username = 'ditt-användarnamn';
```

---

## Premiumnivåer

Systemet är förberett för `FREE` och `PREMIUM`:

- Premium-flagga på profiler och inlägg
- Annonser kan konfigureras att bara visas för gratismedlemmar
- Stripe-integration förberedd via miljövariabler

---

## Annonssystem

Förberett för 4 placeringar:
- `HEADER` – Sidhuvud
- `SIDEBAR` – Sidopanel
- `FEED` – I inläggsflödet
- `FOOTER` – Sidfot

Hanteras i adminpanelen under `/admin/annonser`.

---

## Poäng & Badges

Användare samlar poäng för:
- Nytt inlägg: **+10 poäng**
- Ny kommentar: **+2 poäng** (kan läggas till)
- Fått gillade: **+1 poäng** (kan läggas till)

Badges delas ut automatiskt vid milstolpar.

---

## Deployment (Vercel)

1. Koppla GitHub-repot till Vercel
2. Lägg till alla miljövariabler i Vercel-dashboarden
3. Sätt `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` till din produktionsdomain
4. Deployments sker automatiskt vid push till `main`

---

## Kommando-referens

```bash
npm run dev          # Starta dev-server
npm run build        # Bygg för produktion
npm run lint         # Kör ESLint
npm run db:generate  # Generera Prisma-klient
npm run db:push      # Pusha schema till databas
npm run db:migrate   # Kör migrationer
npm run db:studio    # Öppna Prisma Studio
```
