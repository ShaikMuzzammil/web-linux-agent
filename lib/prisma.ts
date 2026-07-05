// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – generated at build time via `prisma generate`
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

export const prisma: InstanceType<typeof PrismaClient> =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? (["query", "error", "warn"] as const)
        : (["error"] as const),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
