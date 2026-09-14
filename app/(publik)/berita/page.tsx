import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KartuArtikel } from "@/components/ui/KartuArtikel";
import { KickerLabel } from "@/components/ui/KickerLabel";
import { SlotIklanSidebar } from "@/components/publik/SlotIklanSidebar";
import { bylineArtikel, fmtTanggal } from "@/lib/articles";

export const metadata: Metadata = { title: "Berita" };
export const dynamic = "force-dynamic";

export default async function HalamanBerita() {
  const [kategori, artikel] = await Promise.all([
    prisma.kategori.findMany({
      orderBy: [{ isTetap: "desc" }, { nama: "asc" }],
      select: { nama: true, slug: true },
    }),
    prisma.artikel.findMany({
      where: { status: "TERBIT" },
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
        <KickerLabel>Kanal</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl font-extrabold text-hitam-900 md:text-4xl">
          Berita
        </h1>
        <nav aria-label="Pilih kanal berita" className="mt-4 flex flex-wrap gap-2">
          {kategori.map((k) => (
            <Link
              key={k.slug}
              href={`/berita/${k.slug}`}
              className="border border-hitam-900 bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-gmnimerah-500 hover:text-white"
            >
              {k.nama}
            </Link>
          ))}
        </nav>
      </header>

      {artikel.length === 0 ? (
        <div className="mt-10 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
          <p className="font-serif text-xl font-bold text-hitam-900">
            Belum ada terbitan.
          </p>
          <p className="mt-2 text-sm text-hitam-500">
            Tulisan kader yang sudah disetujui redaksi akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-6 md:grid-cols-3">
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
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <SlotIklanSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}