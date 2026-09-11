import type { NextConfig } from "next";

/**
 * Drive D: bertipe FAT32 yang TIDAK mendukung symlink/junction.
 * Turbopack (bundler default Next 16) membuat junction @prisma/client
 * di `.next/node_modules` dan meninggalkan subtree corrupt.
 * Solusi lokal: bundler webpack (via `--webpack` di scripts) + distDir
 * `.next-webpack` agar tidak pernah menyentuh sisa `.next` yang rusak.
 *
 * Di Vercel (Linux/ext4) workaround FAT32 TIDAK diperlukan: Vercel Build
 * diharapkan output standard di `.next`, jadi jalankan tanpa override
 * `distDir` (kondisi: env `VERCEL=1` diset oleh platform Vercel).
 */
const nextConfig: NextConfig = {
  ...(process.env.VERCEL === "1" ? {} : { distDir: ".next-webpack" }),
  /* config options here */
};

export default nextConfig;
