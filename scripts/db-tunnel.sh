#!/usr/bin/env bash
# Öppnar en SSH-tunnel från den här datorn till Minodlings databas på servern.
#
# Databasen kör i en container utan publicerad port och går inte att nå utifrån.
# DATABASE_URL och DIRECT_URL i .env och .env.local pekar därför på
# 127.0.0.1:54327, som är tunnelns lokala ände, med ?sslmode=disable.
#
#   ./scripts/db-tunnel.sh        # låt stå öppen, avsluta med Ctrl+C
#
# Containerns adress slås upp varje gång, eftersom den kan ändras vid omstart.
set -euo pipefail

HOST="${MINODLING_SSH_HOST:-ubuntu@54.38.193.28}"
CONTAINER="supabase-db-rphalyys5m8yv15kac10nmdh"
PORT="${MINODLING_DB_PORT:-54327}"

IP="$(ssh -o BatchMode=yes "$HOST" "sudo docker inspect -f '{{(index .NetworkSettings.Networks \"coolify\").IPAddress}}' $CONTAINER")"

if [[ -z "$IP" ]]; then
  echo "Hittade inte databascontainern $CONTAINER på $HOST." >&2
  exit 1
fi

echo "Tunnel öppen: 127.0.0.1:${PORT} → ${CONTAINER} (${IP}:5432). Avsluta med Ctrl+C."
exec ssh -o BatchMode=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -N -L "127.0.0.1:${PORT}:${IP}:5432" "$HOST"
