import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PanelArtikel } from "@/components/admin/PanelArtikel";

export const metadata: Metadata = { title: "Antrian Redaksi" };
export const dynamic = "force-dynamic";

export default async function HalamanArtikelAdmin() {
  await requirePermission("artikel.publish");

  const artikel = await prisma.artikel.findMany({
    orderBy: [
      { disematkan: "desc" },
      { tanggalDiajukan: "desc" },
      { updatedAt: "desc" },
    ],
    select: {
      id: true,
      judul: true,
      slug: true,
      status: true,
      visibilitasPenulis: true,
      namaTampilanKustom: true,
      kategori: { select: { nama: true } },
      penulis: { select: { namaLengkap: true } },
    },
  });

  const data = artikel.map((a) => ({
    id: a.id,
    judul: a.judul,
    slug: a.slug,
    status: a.status,
    visibilitasPenulis: a.visibilitasPenulis,
    namaTampilanKustom: a.namaTampilanKustom,
    kategoriNama: a.kategori.nama,
    penulisNama: a.penulis.namaLengkap,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Antrian Redaksi
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Tinjau, terbitkan, atau kembalikan tulisan kader. Setiap keputusan
          tercatat di audit log.
        </p>
      </div>
      <PanelArtikel artikel={data} />
    </div>
  );
}