import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KartuArtikel } from "@/components/ui/KartuArtikel";
import { KickerLabel } from "@/components/ui/KickerLabel";
import { bylineArtikel, fmtTanggal } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategoriSlug: string }>;
}): Promise<Metadata> {
  const { kategoriSlug } = await params;
  const kategori = await prisma.kategori.findUnique({ where: { slug: kategoriSlug } });
  return {
    title: kategori?.nama ?? "Kanal Berita",
    description: kategori?.deskripsi ?? undefined,
  };
}

export default async function HalamanKategori({
  params,
}: {
  params: Promise<{ kategoriSlug: string }>;
}) {
  const { kategoriSlug } = await params;
  const [kategori, artikel] = await Promise.all([
    prisma.kategori.findUnique({ where: { slug: kategoriSlug } }),
    prisma.artikel.findMany({
      where: { status: "TERBIT", kategori: { slug: kategoriSlug } },
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
  if (!kategori) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="border-b-2 border-hitam-900 pb-4">
        <KickerLabel>Berita / {kategori.slug}</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl font-extrabold text-hitam-900 md:text-4xl">
          {kategori.nama}
        </h1>
        {kategori.deskripsi && (
          <p className="mt-2 max-w-2xl text-sm text-hitam-500">{kategori.deskripsi}</p>
        )}
      </header>

      {artikel.length === 0 ? (
        <div className="mt-10 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
          <p className="font-serif text-xl font-bold text-hitam-900">
            Kanal ini belum berisi.
          </p>
          <p className="mt-2 text-sm text-hitam-500">
            Tulisan yang sudah terbit di kanal {kategori.nama} akan tampil di sini.
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