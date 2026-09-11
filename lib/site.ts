/**
 * Data situs "info Marhaen" (source of truth kecil untuk UI).
 * Blueprint: Bagian 2 (idenitas), Bagian 4 (sitemap).
 */

export const SITE_NAME = "info Marhaen";
export const DOMAIN = "infomarhaen.id";
export const SITE_URL = `https://${DOMAIN}`;
export const SITE_TAGLINE = "Portal Berita & Suara Marhaenisme";
export const SITE_DESKRIPSI =
  "Portal berita digital milik GMNI. Sikap editorial: oposisi kritis terhadap kebijakan pemerintah. Ditulis oleh kader terverifikasi, dikurasi oleh redaksi.";

/** Navigasi utama (blueprint Bagian 4) */
export const NAV_UTAMA: Array<{ label: string; href: string; aksen?: boolean }> = [
  { label: "Beranda", href: "/" },
  { label: "Berita", href: "/berita" },
  { label: "Marhaenisme", href: "/marhaenisme", aksen: true },
  { label: "Opini", href: "/opini" },
  { label: "Kaderisasi", href: "/kaderisasi" },
  { label: "Tokoh", href: "/tokoh" },
  { label: "Tentang", href: "/tentang" },
];

/** Kategori berita (Bagian 4 — /berita/*) */
export const KATEGORI_BERITA: Array<{ label: string; slug: string }> = [
  { label: "Politik", slug: "politik" },
  { label: "Ekonomi", slug: "ekonomi" },
  { label: "Hukum", slug: "hukum" },
  { label: "Pendidikan", slug: "pendidikan" },
  { label: "Lingkungan", slug: "lingkungan" },
  { label: "Daerah", slug: "daerah" },
  { label: "Nasional", slug: "nasional" },
];

/** Halaman legal & pengaduan (Bagian 4) */
export const HALAMAN_LEGAL: Array<{ label: string; href: string }> = [
  { label: "Pedoman Media Siber", href: "/pedoman-media-siber" },
  { label: "Hak Jawab", href: "/hak-jawab" },
  { label: "Kontak & Pengaduan", href: "/kontak-pengaduan" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
];

/** Halaman info (Bagian 4) */
export const HALAMAN_INFO: Array<{ label: string; href: string }> = [
  { label: "Tentang", href: "/tentang" },
  { label: "Redaksi", href: "/redaksi" },
  { label: "Kaderisasi", href: "/kaderisasi" },
  { label: "Tokoh", href: "/tokoh" },
  { label: "Leaderboard", href: "/leaderboard" },
];