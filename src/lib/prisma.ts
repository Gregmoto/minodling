import { PrismaClient } from "@prisma/client";

/**
 * Prisma-klient som fungerar i två runtimes samtidigt:
 *
 *  - Node (Vercel, lokal utveckling): vanlig PrismaClient mot DATABASE_URL.
 *  - Cloudflare Workers: pg-driveradapter mot Hyperdrive, vars connection
 *    string bara finns i request-kontexten – aldrig vid modulinladdning.
 *
 * Därför byggs klienten lat, vid första faktiska användningen, via en Proxy.
 * Det gör att alla befintliga `import prisma from "@/lib/prisma"` fungerar
 * oförändrat i båda miljöerna.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Hyperdrive-bindningens connection string, eller undefined utanför Workers. */
function hyperdriveUrl(): string | undefined {
  try {
    // Endast tillgänglig i Workers-runtime. Importeras lat så att Node-bygget
    // (Vercel) aldrig behöver lösa upp modulen.
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const env = getCloudflareContext()?.env as
      | { HYPERDRIVE?: { connectionString?: string } }
      | undefined;
    return env?.HYPERDRIVE?.connectionString;
  } catch {
    return undefined;
  }
}

function createClient(): PrismaClient {
  const url = hyperdriveUrl();

  if (url) {
    // Workers: TCP via nodejs_compat, pooling via Hyperdrive.
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");
    return new PrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString: url })),
      log: ["error"],
    });
  }

  // Node: oförändrat beteende mot tidigare.
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lat proxy – klienten instansieras först när en modell faktiskt används,
 * alltså inuti en request där Hyperdrive-bindningen existerar.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
