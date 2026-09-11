import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Sitemap otomatis: rute utama + halaman statis + artikel terbit. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artikel, halaman] = await Promise.all([
    prisma.artikel.findMany({
      where: { status: "TERBIT" },
      select: { slug: true, tanggalTerbit: true, updatedAt: true },
    }),
    prisma.halamanStatis.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const ruteUtama: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/berita`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/opini`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/cari`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const ruteHalaman: MetadataRoute.Sitemap = halaman.map((h) => ({
    url: `${SITE_URL}/${h.slug}`,
    lastModified: h.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const ruteArtikel: MetadataRoute.Sitemap = artikel.map((a) => ({
    url: `${SITE_URL}/artikel/${a.slug}`,
    lastModified: a.tanggalTerbit ?? a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...ruteUtama, ...ruteHalaman, ...ruteArtikel];
}