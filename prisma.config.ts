import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Konfigurasi Prisma CLI (Prisma 6.16+ / siap Prisma 7).
 * Memuat .env secara eksplisit karena prisma.config.ts tidak
 * lagi auto-load environment.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});