import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

type FilterKey = "SEMUA" | "TAMPIL" | "DISEMBUNYIKAN" | "DILAPORKAN";
type StatusKomentarF = "TAMPIL" | "DISEMBUNYIKAN";

const FILTER: Record<string, FilterKey> = {
  SEMUA: "SEMUA",
  TAMPIL: "TAMPIL",
  DISEMBUNYIKAN: "DISEMBUNYIKAN",
  DILAPORKAN: "DILAPORKAN",
};

/** GET /api/admin/komentar?status=... — daftar komentar untuk moderasi (blueprint 8.3). */
export async function GET(request: Request) {
  await requirePermission("komentar.moderasi");

  const { searchParams } = new URL(request.url);
  const key = (searchParams.get("status") ?? "SEMUA").toUpperCase();
  const filter: FilterKey = FILTER[key] ?? "SEMUA";

  const where =
    filter === "SEMUA"
      ? {}
      : filter === "DILAPORKAN"
        ? { status: "TAMPIL" as const, jumlahLaporan: { gt: 0 } }
        : { status: filter as StatusKomentarF };

  const komentar = await prisma.komentar.findMany({
    where,
    orderBy: [{ jumlahLaporan: "desc" }, { tanggal: "desc" }],
    take: 100,
    include: {
      artikel: { select: { judul: true, slug: true } },
      penulis: { select: { id: true, namaLengkap: true, username: true } },
    },
  });

  return NextResponse.json({ komentar });
}