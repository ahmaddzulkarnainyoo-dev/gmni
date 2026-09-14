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
  poweredByHeader: false,
  // Security headers produksi (Sub-Fase 4.2, kebijakan konservatif).
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js butuh inline script/style untuk hydration & Tailwind runtime.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; ");
    const keamanan = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      // HSTS hanya di produksi (localhost dev tanpa HTTPS).
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
    ];
    return [{ source: "/:path*", headers: keamanan }];
  },
};

export default nextConfig;
