# Aset Brand "info Marhaen"

Folder ini adalah lokasi resmi aset branding (blueprint Bagian 2.3).

## Status aset saat ini
- `public/logo.png` — logo resmi GMNI (1456×1440, RGBA) **tersedia** diletakkan
  oleh pemilik proyek di root folder `public/`.
- Header & footer situs memakai `public/logo.png` langsung.
- Favicon sudah turunkan dari logo → `app/favicon.ico` (multi-resolusi,
  embedded PNG). Regenerate setelah logo berubah:
  `node scripts/generate-favicon.mjs`.
- Emblem SVG placeholder di `components/brand/LogoGMNI.tsx` masih dipakai
  untuk aset kecil (auth/dasbor/admin, badge, watermark, 404).

## Sumber & turunan
1. **Favicon multi-resolusi** → `app/favicon.ico` (via `scripts/generate-favicon.mjs`).
2. **Logo versi putih** → untuk latar gelap (header hitam, footer, placeholder gambar) — menyusul.
3. **Versi ikon saja** → avatar default kader & watermark (halaman 404, kategori Marhaenisme) — menyusul.

## Catatan kontras
Merah `#E53935`, Putih kusam `#FAF9F5`, Hitam `#141414` — lihat `app/globals.css`.
Semua aset visual wajib konsisten dengan filosofi lambang GMNI (blueprint Bagian 3).