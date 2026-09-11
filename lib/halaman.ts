import { prisma } from "@/lib/prisma";

/** Ambil konten halaman statis (Fase 1: data live dari HalamanStatis). */
export async function ambilHalaman(slug: string) {
  return prisma.halamanStatis.findUnique({ where: { slug } });
}

/** Ringkasan deskripsi untuk metadata dari konten HTML sebuah halaman. */
export function deskripsiDariHalaman(h: { judul: string; konten: string }): string {
  const bersih = h.konten
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return bersih.slice(0, 160) || h.judul;
}