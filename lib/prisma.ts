import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient — mencegah kelebihan koneksi saat hot-reload di dev.
 * Dipakai seluruh aplikasi (server components, route handlers, seed).
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}