import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { amanAsync } from "@/lib/kueri-aman";
import { TabelLaporan } from "@/components/admin/TabelLaporan";

export const metadata: Metadata = { title: "Laporan Penyalahgunaan" };
export const dynamic = "force-dynamic";

/**
 * Panel rekapitulasi laporan terpusat (blueprint 8.3):
 * daftar komentar dengan jumlahLaporan > 0 + aksi moderasi
 * (sembunyikan / abaikan laporan / hapus permanen).
 */
export default async function HalamanLaporanAdmin() {
  await requirePermission("komentar.moderasi");

  const syarat = { jumlahLaporan: { gt: 0 } };

  const [totalKomentar, agregat, komentar, gagalMemuat] = await amanAsync(
    () =>
      Promise.all([
        prisma.komentar.count({ where: syarat }),
        prisma.komentar.aggregate({
          where: syarat,
          _sum: { jumlahLaporan: true },
        }),
        prisma.komentar.findMany({
          where: syarat,
          orderBy: [{ jumlahLaporan: "desc" }, { tanggal: "desc" }],
          take: 100,
          include: {
            artikel: { select: { judul: true, slug: true } },
            penulis: { select: { id: true, namaLengkap: true, username: true } },
          },
        }),
        Promise.resolve(false),
      ]),
    [0, { _sum: { jumlahLaporan: null } }, [], true],
  );

  const totalLaporan = agregat._sum.jumlahLaporan ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Laporan Penyalahgunaan
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Rekap komentar yang dilaporkan pengunjung — sembunyikan, abaikan
          laporan, atau hapus permanen.
        </p>
      </div>

      {gagalMemuat && (
        <p
          role="alert"
          className="mt-4 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-4 py-2.5 text-sm font-semibold text-gmnimerah-700"
        >
          Data tidak dapat dimuat sementara — periksa koneksi database lalu
          muat ulang halaman.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border-2 border-hitam-900 bg-white p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-500">
            Komentar Dilaporkan
          </p>
          <p className="mt-1 font-serif text-3xl font-extrabold text-hitam-900">
            {totalKomentar}
          </p>
        </div>
        <div className="border-2 border-gmnimerah-500 bg-white p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-600">
            Total Laporan Masuk
          </p>
          <p className="mt-1 font-serif text-3xl font-extrabold text-gmnimerah-700">
            {totalLaporan}
          </p>
        </div>
      </div>

      <TabelLaporan
        laporan={komentar.map((k) => ({
          id: k.id,
          isi: k.isi,
          status: k.status,
          jumlahLaporan: k.jumlahLaporan,
          tanggal: k.tanggal.toISOString(),
          namaTamu: k.namaTamu,
          artikel: { judul: k.artikel.judul, slug: k.artikel.slug },
          penulis: k.penulis,
        }))}
      />
    </div>
  );
}
