import { PrismaClient } from "./prisma-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Prisma-klient för två runtimes.
 *
 * Med queryCompiler kör Prisma helt i JS/WASM utan binär motor, vilket är
 * förutsättningen för Cloudflare Workers. Driveradaptern krävs då alltid,
 * så pg används i båda miljöerna – skillnaden är bara anslutningen:
 *
 *  - Workers: Hyperdrive, vars connection string bara finns i request-
 *    kontexten. Därför byggs klienten lat, via en Proxy.
 *  - Node (Vercel, lokalt): DATABASE_URL.
 *
 * Alla befintliga `import prisma from "@/lib/prisma"` fungerar oförändrat.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function connectionString(): string {
  try {
    const ctx = getCloudflareContext() as
      | { env?: { HYPERDRIVE?: { connectionString?: string } } }
      | undefined;
    const url = ctx?.env?.HYPERDRIVE?.connectionString;
    if (url) return url;
  } catch {
    // Inte i Workers-runtime – faller igenom till DATABASE_URL.
  }
  return process.env.DATABASE_URL ?? "";
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: connectionString() }),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
