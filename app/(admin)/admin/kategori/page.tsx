import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PanelKategori } from "@/components/admin/PanelKategori";

export const metadata: Metadata = { title: "Kategori" };
export const dynamic = "force-dynamic";

export default async function HalamanKategoriAdmin() {
  // Gate role (Super Admin/Editor) sudah diterapkan di layout; permission
  // redaksi memastikan hanya orang yang boleh mengelola artikel yang lewat.
  await requireRole("Super Admin", "Editor");

  const [kategori, totalArtikel] = await Promise.all([
    prisma.kategori.findMany({
      orderBy: [{ isTetap: "desc" }, { nama: "asc" }],
      select: { id: true, nama: true, slug: true, deskripsi: true, isTetap: true },
    }),
    prisma.artikel.groupBy({ by: ["kategoriId"], _count: { _all: true } }),
  ]);

  const hitung = new Map<string, number>();
  for (const baris of totalArtikel) hitung.set(baris.kategoriId, baris._count._all);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Kategori
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Taksonomi kanal berita. Kategori tetap Marhaenisme tidak dapat
          dihapus (blueprint 7.4).
        </p>
      </div>
      <PanelKategori
        kategori={kategori.map((k) => ({
          id: k.id,
          nama: k.nama,
          slug: k.slug,
          deskripsi: k.deskripsi,
          isTetap: k.isTetap,
          jumlahArtikel: hitung.get(k.id) ?? 0,
        }))}
      />
    </div>
  );
}