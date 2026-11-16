import { PrismaClient } from "@prisma/client";

// PrismaClient singleton — one client per process, even under Next.js
// hot reload in development (see https://pris.ly/d/client).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
