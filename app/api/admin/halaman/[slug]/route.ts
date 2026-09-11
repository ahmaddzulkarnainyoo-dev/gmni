import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

/** Menyimpan konten halaman statis (blueprint 12: editable admin, no-code). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const user = await requirePermission("halaman_statis.edit");

  const halaman = await prisma.halamanStatis.findUnique({ where: { slug } });
  if (!halaman) {
    return NextResponse.json({ error: "Halaman tidak ditemukan." }, { status: 404 });
  }

  const body = (await request.json()) as { judul?: unknown; konten?: unknown };
  const judul = typeof body.judul === "string" ? body.judul.trim() : null;
  const konten = typeof body.konten === "string" ? body.konten.trim() : null;
  if (!judul || !konten) {
    return NextResponse.json({ error: "Judul dan konten wajib diisi." }, { status: 400 });
  }

  const diperbarui = await prisma.$transaction([
    prisma.halamanStatis.update({
      where: { slug },
      data: { judul, konten, terakhirDiubahOlehId: user.id },
    }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: "halaman.update",
        entitasTipe: "HalamanStatis",
        entitasId: halaman.id,
        dataSebelum: { judul: halaman.judul, panjang: halaman.konten.length },
        dataSesudah: { judul, panjang: konten.length },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, slug, judul: diperbarui[0].judul });
}