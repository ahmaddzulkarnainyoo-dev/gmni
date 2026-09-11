# info Marhaen

Portal berita & komunitas kader **GMNI** dengan sikap editorial **oposisi kritis terhadap kebijakan pemerintah**.
Ditulis oleh kader terverifikasi, dikurasi oleh redaksi, dibungkus lapisan komunitas sosial internal + gamifikasi.

> **Sumber kebenaran tunggal:** `blueprint.md` (Bagian 1–12 final). Semua skema, UI, alur editorial, dan RBAC wajib tunduk padanya.

## Tech Stack (blueprint Bagian 10)

| Layer | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (design tokens GMNI — Merah `#E53935`, kertas `#FAF9F5`, hitam `#141414`) |
| Database | PostgreSQL (Prisma 6) |
| Autentikasi | NextAuth/Auth.js + invite token (Fase 1) |
| Infra | Vercel + Cloudflare, Sentry, Vercel Cron, GA4 (bertahap) |

## Persyaratan

- Node.js ≥ 20 (teruji di v24), npm
- PostgreSQL (via Docker: `docker compose up -d` — atau pakai connection string Neon/Vercel Postgres)

## Setup Developer

```bash
# 1. salin konfigurasi lingkungan
copy .env.example .env        # lalu isi SEED_ADMIN_* & DATABASE_URL

# 2. database lokal (opsional bila belum punya Postgres)
docker compose up -d

# 3. instalasi, migrasi, seed
npm install
npm run db:migrate            # prisma migrate dev
npm run db:seed               # prisma db seed

# 4. jalankan
npm run dev                   # http://localhost:3000
```

### Script penting

| Script | Fungsi |
|---|---|
| `npm run dev` / `start` | Next.js dev (webpack) / production |
| `npm run build` | `next build --webpack` (fail-safe FAT32/Symlink) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` / `db:deploy` | Migrasi dev / produksi |
| `npm run db:seed` | Seed idempoten (RBAC, kategori, halaman, Super Admin dari env) |
| `npm run db:generate` / `db:studio` | Generate client / Prisma Studio |

> **Catatan mesin dengan `node_modules` di FAT32** (contoh drive `D:`):
> Turbopack (bundler default Next 16) tidak kompatibel dengan FAT32 karena
> membutuhkan symlink/junction. Proyek ini memakai `--webpack` dan
> `distDir: ".next-webpack"` **solo lokal** — di Vercel (`VERCEL=1`)
> `distDir` menyok `undefined` sehingga output menyampa ke `.next`
> (default, lihat `next.config.ts`). Sebelum build lokal pertama,
> jalankan sekali: `node scripts/patch-next-fat32.mjs` untuk menambal
> handling `EISDIR` pada `readlink` (idempoten).

## Struktur Folder

```
app/
├── (publik)/   → halaman publik sesuai sitemap Bagian 4 (beranda, berita, kanal, legal)
├── (auth)/     → login, daftar (invite token), lupa-password
├── (dasbor)/   → dasbor kader (tulis, tulisan-saya, pesan, notifikasi, pencapaian, pengaturan)
└── (admin)/    → admin (redaksi, artikel, pengguna, peran, komentar, laporan,
                 audit-log, leaderboard, halaman, tampilan, iklan-donasi, pengaturan)
components/     → ui (tombol, kartu, kicker, divider trisila, badge) + publik/dasbor shell
lib/            → prisma singleton, konstanta situs, utilitas
prisma/         → schema.prisma, seed.ts, prisma.config.ts
scripts/        → generate-routes.ps1 (buat rute placeholder sesuai sitemap)
public/brand/   → logo resmi GMNI (menyusul) & aset turunan
```

## Roadmap (blueprint Bagian 11)

- **Fase 0 — Fondasi** — design tokens GMNI, komponen dasar, skema Prisma inti, seed, struktur sitemap.
- **Fase 1 — MVP Portal Berita** — invite & registrasi, editor + alur redaksi, kategori/tag, halaman statis, seed konten resmi, SEO dasar, cookie consent, panel RBAC, audit log, keamanan dasar.
- **Fase 2** — komentar + newsletter + visibilitas penulis + profil publik.
- **Fase 3** — DM real-time, streak, leaderboard + badge, report/block.
- **Fase 4** — monetisasi, 2FA, performa, kanal daerah/DPC.

## Keamanan (blueprint Bagian 9)

- Anonimitas penulis adalah janji: artikel samaran dikecualikan dari gamifikasi & tak tertaut profil.
- Audit log lengkap dengan snapshot sebelum/sesudah.
- Sandi di-hash bcrypt (cost 12); token undangan unik.
- Env secrets hanya di `.env` (tidak di-commit).