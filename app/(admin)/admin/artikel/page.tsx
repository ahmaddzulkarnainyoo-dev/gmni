import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TabelArtikelAdmin } from "@/components/admin/TabelArtikelAdmin";
import type { Prisma, StatusArtikel } from "@prisma/client";

export const metadata: Metadata = { title: "Kelola Artikel" };
export const dynamic = "force-dynamic";

const PER_HALAMAN = 10;

export default async function HalamanArtikelAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; status?: string; halaman?: string }>;
}) {
  await requirePermission("artikel.publish");

  const { q, kategori, status, halaman } = await searchParams;
  const kataKunci = q?.trim() ?? "";
  const kategoriId = kategori ?? "";
  const statusFilter = status ?? "";
  const nomorHalaman = Math.max(1, parseInt(halaman ?? "1", 10) || 1);

  const where: Prisma.ArtikelWhereInput = {
    AND: [
      kataKunci ? { judul: { contains: kataKunci, mode: "insensitive" } } : {},
      kategoriId ? { kategoriId } : {},
      statusFilter ? { status: statusFilter as StatusArtikel } : {},
    ],
  };

  const [total, artikel, kategoriList] = await Promise.all([
    prisma.artikel.count({ where }),
    prisma.artikel.findMany({
      where,
      orderBy: [{ disematkan: "desc" }, { updatedAt: "desc" }],
      skip: (nomorHalaman - 1) * PER_HALAMAN,
      take: PER_HALAMAN,
      select: {
        id: true,
        judul: true,
        slug: true,
        status: true,
        disematkan: true,
        gambarUtama: true,
        tanggalTerbit: true,
        visibilitasPenulis: true,
        namaTampilanKustom: true,
        kategori: { select: { nama: true } },
        penulis: { select: { namaLengkap: true } },
      },
    }),
    prisma.kategori.findMany({ orderBy: [{ isTetap: "desc" }, { nama: "asc" }] }),
  ]);

  const jumlahHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));

  const data = artikel.map((a) => ({
    id: a.id,
    judul: a.judul,
    slug: a.slug,
    status: a.status,
    disematkan: a.disematkan,
    gambarUtama: a.gambarUtama,
    tanggalTerbit: a.tanggalTerbit?.toISOString() ?? null,
    kategoriNama: a.kategori.nama,
    penulisNama: a.penulis.namaLengkap,
    visibilitasPenulis: a.visibilitasPenulis,
    namaTampilanKustom: a.namaTampilanKustom,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-hitam-900 pb-3">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
            Kelola Artikel
          </h1>
          <p className="mt-1 text-sm text-hitam-500">
            Cari, saring, buat, dan sunting seluruh artikel dari satu tempat.
          </p>
        </div>
        <Link
          href="/admin/artikel/tulis"
          className="bg-gmnimerah-500 px-5 py-2.5 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600"
        >
          + Tulis Artikel
        </Link>
      </div>

      <TabelArtikelAdmin
        artikel={data}
        total={total}
        halaman={nomorHalaman}
        jumlahHalaman={jumlahHalaman}
        kataKunci={kataKunci}
        kategoriId={kategoriId}
        statusFilter={statusFilter}
        kategori={kategoriList.map((k) => ({
          id: k.id,
          nama: k.nama,
          isTetap: k.isTetap,
        }))}
      />
    </div>
  );
}