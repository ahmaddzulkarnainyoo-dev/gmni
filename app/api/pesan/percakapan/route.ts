import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/** GET /api/pesan/percakapan — daftar room aktif milikku (blueprint 8.5). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Harus masuk terlebih dahulu." },
      { status: 401 },
    );
  }
  if (!user.permissions.includes("pesan.kirim")) {
    return NextResponse.json(
      { error: "Akun Anda tidak memiliki izin berkirim pesan." },
      { status: 403 },
    );
  }

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
              status: true,
              tanggal: true,
              pengirimId: true,
            },
          },
        },
      },
    },
  });

  const percakapan = await Promise.all(
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
        pesanTerakhirAt: a.percakapan.pesanTerakhirAt,
        lawan,
        pesanTerakhir: terakhir,
        belumDibaca,
      };
    }),
  );

  return NextResponse.json({ percakapan });
}
