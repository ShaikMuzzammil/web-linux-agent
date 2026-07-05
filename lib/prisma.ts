/**
 * Prisma v7 — driver adapter pattern
 * Prisma v7 removed `url` from schema.prisma — connection is passed via adapter.
 * Uses @prisma/adapter-pg (pg Pool) for direct PostgreSQL connection.
 */

// @ts-ignore — generated at build time via `prisma generate`
import { PrismaClient } from "@prisma/client";
// @ts-ignore — typed after generate
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // Build-time / static pages — no DB connection needed
    console.warn("⚠️  DATABASE_URL not set — Prisma running in stub mode");
    // Return a client with adapter set to null; API routes will fail gracefully
    return new PrismaClient({ adapter: null as never });
  }

  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? (["query", "warn", "error"] as const)
      : (["error"] as const),
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
