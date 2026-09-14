import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, KATEGORI_BERITA } from "@/lib/site";

/**
 * Sitemap otomatis (Sub-Fase 4.2 diaudit privasi):
 * - Artikel TERBIT hanya visibilitas ASLI/REDAKSI — SAMARAN TIDAK bocor.
 * - Profil publik hanya akun AKTIF tanpa profilTersembunyi.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artikel, halaman, profil] = await Promise.all([
    prisma.artikel.findMany({
      where: {
        status: "TERBIT",
        visibilitasPenulis: { in: ["ASLI", "REDAKSI"] },
      },
      select: { slug: true, tanggalTerbit: true, updatedAt: true },
    }),
    prisma.halamanStatis.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.user.findMany({
      where: { statusAkun: "AKTIF", profilTersembunyi: false },
      select: { username: true },
      take: 500,
    }),
  ]);

  const ruteUtama: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/berita`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/opini`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/leaderboard`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/donasi`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/tokoh`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/cari`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const ruteKategori: MetadataRoute.Sitemap = KATEGORI_BERITA.map((k) => ({
    url: `${SITE_URL}/berita/${k.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const ruteHalaman: MetadataRoute.Sitemap = halaman.map((h) => ({
    url: `${SITE_URL}/${h.slug}`,
    lastModified: h.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const ruteProfil: MetadataRoute.Sitemap = profil.map((p) => ({
    url: `${SITE_URL}/profil/${p.username}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const ruteArtikel: MetadataRoute.Sitemap = artikel.map((a) => ({
    url: `${SITE_URL}/artikel/${a.slug}`,
    lastModified: a.tanggalTerbit ?? a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...ruteUtama, ...ruteKategori, ...ruteHalaman, ...ruteProfil, ...ruteArtikel];
}