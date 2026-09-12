import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PanelKomentar } from "@/components/admin/PanelKomentar";

export const metadata: Metadata = { title: "Moderasi Komentar" };
export const dynamic = "force-dynamic";

export default async function HalamanKomentarAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission("komentar.moderasi");

  const { status } = await searchParams;
  const f = (status ?? "SEMUA").toUpperCase();
  const filter =
    f === "DILAPORKAN"
      ? "DILAPORKAN"
      : f === "TAMPIL"
        ? "TAMPIL"
        : f === "DISEMBUNYIKAN"
          ? "DISEMBUNYIKAN"
          : "SEMUA";

  const where =
    filter === "SEMUA"
      ? {}
      : filter === "DILAPORKAN"
        ? { status: "TAMPIL" as const, jumlahLaporan: { gt: 0 } }
        : { status: filter as "TAMPIL" | "DISEMBUNYIKAN" };

  const komentar = await prisma.komentar.findMany({
    where,
    orderBy: [{ jumlahLaporan: "desc" }, { tanggal: "desc" }],
    take: 100,
    include: {
      artikel: { select: { judul: true, slug: true } },
      penulis: { select: { id: true, namaLengkap: true, username: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Moderasi Komentar
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Sembunyikan, hapus, atau benarkan laporan komentar publik (blueprint 8.3).
        </p>
      </div>
      <PanelKomentar
        aktif={filter}
        komentar={komentar.map((k) => ({
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