import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** POST /api/komentar/[id]/lapor — pengunjung melaporkan komentar (blueprint 8.3). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const komentar = await prisma.komentar.findUnique({ where: { id } });
    if (!komentar) {
      return NextResponse.json({ error: "Komentar tidak ditemukan." }, { status: 404 });
    }

    await prisma.komentar.update({
      where: { id },
      data: { jumlahLaporan: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[komentar] Gagal melaporkan:", error);
    return NextResponse.json({ error: "Gagal melaporkan komentar." }, { status: 500 });
  }
}