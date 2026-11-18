# =====================================================================
# Minodling – produktionsbild för Coolify.
#
# Tre steg: beroenden, bygge, körning. Bara det tredje följer med i den
# färdiga bilden, så den innehåller varken källkod eller byggverktyg.
#
# NEXT_PUBLIC_*: Next bakar in dem i klientbundeln vid BYGGET, inte vid
# start. De skickas därför som build args (Coolify: Build Variables).
# Allt annat – databas, nycklar – läses först vid körning och får aldrig
# hamna i bygget.
#
# Databasen nås inte under bygget. Det går bra: de enda förrenderade
# sidor som aldrig revalideras är ikonerna och manifestet, och allt som
# läser databasen renderas vid körning eller förnyas inom fem minuter.
#
# Node 24: package-lock.json är skapad av npm 11. npm 10 i node:22 löser
# optionella plattformsberoenden annorlunda och får `npm ci` att fallera.
#
# openssl: Prismas query-motor för Alpine (linux-musl-openssl-3.0.x)
# länkar mot libssl 3 och behövs både när klienten genereras och vid körning.
# =====================================================================
FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_TELEMETRY_DISABLED=1

# `npm run build` = `prisma generate && next build`.
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0

# Kör som icke-root. node:alpine har redan användaren "node" (uid 1000).
# Standalone-katalogen innehåller själv node_modules/.prisma med motorn.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
