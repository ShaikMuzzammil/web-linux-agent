// Prisma v7 — requires a driver adapter (no url in schema.prisma)
// Using @prisma/adapter-pg with the standard `pg` pool

// @ts-ignore — generated at build time via `prisma generate`
import { PrismaClient } from "@prisma/client";
// @ts-ignore — adapter for pg driver
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // During build/static generation without DB — return stub
    console.warn("[prisma] DATABASE_URL not set — using noop client");
    return new PrismaClient({ adapter: null as never });
  }

  const pool = new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
