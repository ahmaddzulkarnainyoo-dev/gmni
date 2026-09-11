import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KartuArtikel } from "@/components/ui/KartuArtikel";
import { KickerLabel } from "@/components/ui/KickerLabel";
import { bylineArtikel, fmtTanggal } from "@/lib/articles";

export const metadata: Metadata = { title: "Opini" };
export const dynamic = "force-dynamic";

export default async function HalamanOpini() {
  const [kategori, artikel] = await Promise.all([
    prisma.kategori.findUnique({ where: { slug: "opini" } }),
    prisma.artikel.findMany({
      where: { status: "TERBIT", kategori: { slug: "opini" } },
      orderBy: [{ disematkan: "desc" }, { tanggalTerbit: "desc" }],
      take: 30,
      select: {
        id: true,
        judul: true,
        slug: true,
        ringkasan: true,
        gambarUtama: true,
        visibilitasPenulis: true,
        namaTampilanKustom: true,
        tanggalTerbit: true,
        kategori: { select: { nama: true, slug: true } },
        penulis: { select: { namaLengkap: true, username: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="border-b-2 border-hitam-900 pb-4">
        <KickerLabel>Opini</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl font-extrabold text-hitam-900 md:text-4xl">
          Opini
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-hitam-500">
          Esai, analisis, dan sikap kader atas keadaan zaman. Suara rakyat
          kecil yang tidak diberi ruang di media arus utama.
        </p>
      </header>

      {artikel.length === 0 ? (
        <div className="mt-10 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
          <p className="font-serif text-xl font-bold text-hitam-900">
            Kolom opini masih kosong.
          </p>
          <p className="mt-2 text-sm text-hitam-500">
            Pendapat kader yang telah disetujui redaksi akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {artikel.map((a) => (
            <KartuArtikel
              key={a.id}
              judul={a.judul}
              ringkasan={a.ringkasan ?? undefined}
              kategori={{ nama: a.kategori.nama, slug: a.kategori.slug }}
              tanggal={fmtTanggal(a.tanggalTerbit)}
              penulis={bylineArtikel(a).nama}
              gambar={a.gambarUtama}
              slug={a.slug}
            />
          ))}
        </div>
      )}

      <p className="mt-10">
        <Link
          href="/berita"
          className="font-mono text-[12px] font-bold uppercase tracking-widest text-gmnimerah-600 hover:text-gmnimerah-700"
        >
          ← Semua Berita
        </Link>
      </p>
    </div>
  );
}