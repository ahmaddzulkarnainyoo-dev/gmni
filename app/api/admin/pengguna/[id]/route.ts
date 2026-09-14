import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import type { StatusAkun } from "@prisma/client";

/** Menangguhkan / mengaktifkan / memverifikasi akun kader (pengguna.suspend).
 *
 * Transisi yang didukung:
 * - AKTIF → SUSPEND (tangguhkan) / SUSPEND → AKTIF (aktifkan)
 * - PENDING → AKTIF (setujui pendaftaran) / PENDING → SUSPEND (tolak)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requirePermission("pengguna.suspend");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Kader tidak ditemukan." }, { status: 404 });
  }
  if (target.id === user.id) {
    return NextResponse.json({ error: "Tidak dapat mengubah status akun sendiri." }, { status: 400 });
  }

  const body = (await request.json()) as { statusAkun?: unknown };
  const statusAkun = body.statusAkun;
  if (statusAkun !== "AKTIF" && statusAkun !== "SUSPEND" && statusAkun !== "PENDING") {
    return NextResponse.json({ error: "Status akun tidak valid." }, { status: 400 });
  }

  // Verifikasi pendaftaran: dari PENDING hanya boleh ke AKTIF (setujui)
  // atau SUSPEND (tolak).
  if (
    target.statusAkun === "PENDING" &&
    statusAkun !== "AKTIF" &&
    statusAkun !== "SUSPEND"
  ) {
    return NextResponse.json(
      { error: "Pendaftaran menunggu hanya bisa disetujui atau ditolak." },
      { status: 400 },
    );
  }

  const aksi =
    target.statusAkun === "PENDING" && statusAkun === "AKTIF"
      ? "user.setujui_kader"
      : target.statusAkun === "PENDING" && statusAkun === "SUSPEND"
        ? "user.tolak_kader"
        : statusAkun === "SUSPEND"
          ? "user.suspend"
          : "user.aktivasi";

  const diperbarui = await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { statusAkun: statusAkun as StatusAkun } }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi,
        entitasTipe: "User",
        entitasId: target.id,
        dataSebelum: { statusAkun: target.statusAkun },
        dataSesudah: { statusAkun },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, email: target.email, statusAkun: diperbarui[0].statusAkun });
}