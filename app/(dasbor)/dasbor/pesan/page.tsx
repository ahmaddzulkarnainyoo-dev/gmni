import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RuangObrolan } from "@/components/dasbor/pesan/RuangObrolan";

export const metadata: Metadata = { title: "Pesan" };
export const dynamic = "force-dynamic";

/**
 * DM antar kader - /dasbor/pesan (blueprint 8.5).
 * Prefetch daftar room di server, interaksi + polling di client.
 */
export default async function HalamanPesan({
  searchParams,
}: {
  searchParams: Promise<{ dengan?: string }>;
}) {
  const user = await requirePermission("pesan.kirim");
  const { dengan } = await searchParams;

  const keanggotaan = await prisma.anggotaPercakapan.findMany({
    where: { userId: user.id },
    orderBy: { percakapan: { pesanTerakhirAt: "desc" } },
    take: 50,
    include: {
      percakapan: {
        include: {
          anggota: {
            where: { userId: { not: user.id } },
            include: {
              user: {
                select: {
                  id: true,
                  namaLengkap: true,
                  username: true,
                  fotoProfil: true,
                  statusAkun: true,
                },
              },
            },
          },
          pesan: {
            orderBy: { tanggal: "desc" },
            take: 1,
            select: {
              id: true,
              isi: true,
              tanggal: true,
              pengirimId: true,
            },
          },
        },
      },
    },
  });

  const awal = await Promise.all(
    keanggotaan.map(async (a) => {
      const lawan = a.percakapan.anggota[0]?.user ?? null;
      const terakhir = a.percakapan.pesan[0] ?? null;
      const acuan = a.terakhirDibacaAt ?? a.tanggalBergabung;
      const belumDibaca = terakhir
        ? await prisma.pesan.count({
            where: {
              percakapanId: a.percakapanId,
              tanggal: { gt: acuan },
              pengirimId: { not: user.id },
            },
          })
        : 0;
      return {
        id: a.percakapanId,
        pesanTerakhirAt: a.percakapan.pesanTerakhirAt?.toISOString() ?? null,
        lawan,
        pesanTerakhir: terakhir
          ? {
              isi: terakhir.isi,
              tanggal: terakhir.tanggal.toISOString(),
              pengirimId: terakhir.pengirimId,
            }
          : null,
        belumDibaca,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Pesan Kader
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Obrolan langsung 1-on-1 antar kader - privat, bukan untuk publik.
        </p>
      </div>
      <div className="mt-6">
        <RuangObrolan userId={user.id} awal={awal} denganUsername={dengan} />
      </div>
    </div>
  );
}
