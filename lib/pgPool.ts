import { Pool } from "pg";

/**
 * Global singleton PostgreSQL connection pool and schema initialization cache.
 * Prevents exhausting managed PostgreSQL connection limits during Next.js HMR reloads
 * or across separate server modules / parallel polling requests.
 */

const rawConnectionString = process.env.DATABASE_URL || "";
const connectionString = rawConnectionString.split("?")[0].trim();

type GlobalWithPg = typeof globalThis & {
  __ughamPgPool?: Pool | null;
  __ughamDbInitPromises?: Record<string, Promise<void> | undefined>;
};

const globalForPg = globalThis as GlobalWithPg;

function createSharedPool(): Pool | null {
  if (!connectionString) return null;
  const created = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 4,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 8000,
    allowExitOnIdle: true,
  });

  created.on("error", (err) => {
    console.error("PostgreSQL idle pool client error:", err.message);
  });

  return created;
}

export const pgPool: Pool | null =
  globalForPg.__ughamPgPool !== undefined
    ? globalForPg.__ughamPgPool
    : (globalForPg.__ughamPgPool = createSharedPool());

/**
 * Deduplicates and caches one-time table initialization per key on globalThis.
 * Clears cached promise if initialization fails so subsequent requests can retry.
 */
export async function runOnceInitialized(key: string, fn: () => Promise<void>): Promise<void> {
  if (!pgPool) {
    await fn();
    return;
  }
  if (!globalForPg.__ughamDbInitPromises) {
    globalForPg.__ughamDbInitPromises = {};
  }
  const cache = globalForPg.__ughamDbInitPromises;
  if (!cache[key]) {
    cache[key] = fn().catch((err) => {
      delete cache[key];
      throw err;
    });
  }
  return cache[key];
}
