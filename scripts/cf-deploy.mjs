/**
 * Deployar till Cloudflare Workers.
 *
 * Wrangler kräver en lokal Postgres-sträng för att emulera Hyperdrive vid
 * deploy. Den läses här ur .env i stället för att ligga i wrangler.jsonc,
 * så att lösenordet aldrig hamnar i versionshanteringen.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function fromEnvFile(key) {
  for (const file of [".env.local", ".env"]) {
    try {
      const m = readFileSync(file, "utf8").match(new RegExp(`^${key}=(.*)$`, "m"));
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    } catch { /* filen finns inte */ }
  }
  return undefined;
}

const db = process.env.DATABASE_URL ?? fromEnvFile("DATABASE_URL");
if (!db) {
  console.error("DATABASE_URL saknas i .env / .env.local");
  process.exit(1);
}

const r = spawnSync("npx", ["wrangler", "deploy", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    CLOUDFLARE_BUILD: "1",
    CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE: db,
    CLOUDFLARE_API_TOKEN: "", // tvinga OAuth-sessionen, inte read-only-token
  },
});
process.exit(r.status ?? 1);
