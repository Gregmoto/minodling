import { PrismaClient as NodePrismaClient } from "@prisma/client";
import { PrismaClient as EdgePrismaClient } from "./prisma-client";

/** Typen är identisk för båda klienterna – de genereras ur samma schema. */
type PrismaClient = NodePrismaClient;
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

/**
 * På Workers är Hyperdrive-anslutningen giltig endast inom en request.
 * Klienten cachas därför på request-kontexten (ExecutionContext), inte
 * globalt – en global singleton håller kvar en död anslutning och alla
 * anrop efter det första misslyckas tyst.
 */
function getClient(): PrismaClient {
  try {
    const ctx = getCloudflareContext() as unknown as {
      env?: { HYPERDRIVE?: { connectionString?: string } };
      ctx?: Record<string, unknown>;
    };
    const url = ctx?.env?.HYPERDRIVE?.connectionString;
    if (url) {
      const store = (ctx.ctx ?? ctx) as Record<string, unknown>;
      if (!store.__prisma) {
        store.__prisma = new (EdgePrismaClient as typeof NodePrismaClient)({
          adapter: new PrismaPg({ connectionString: url }),
          log: ["error"],
        });
      }
      return store.__prisma as PrismaClient;
    }
  } catch {
    // Inte i Workers-runtime.
  }

  // Node (Vercel, lokalt, samt prerendering under bygget).
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new NodePrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
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
