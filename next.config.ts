import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Drive D: bertipe FAT32 yang TIDAK mendukung symlink/junction.
   * Turbopack (bundler default Next 16) membuat junction @prisma/client
   * di `.next/node_modules` dan meninggalkan subtree corrupt.
   * Solusi: bundler webpack (via `--webpack` di scripts) + distDir segar
   * agar tidak pernah menyentuh sisa `.next` yang rusak.
   */
  distDir: ".next-webpack",
  /* config options here */
};

export default nextConfig;
