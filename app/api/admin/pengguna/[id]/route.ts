import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import type { StatusAkun } from "@prisma/client";

/** Menangguhkan / mengaktifkan akun kader (pengguna.suspend). */
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
    return NextResponse.json({ error: "Tidak dapat menangguhkan akun sendiri." }, { status: 400 });
  }

  const body = (await request.json()) as { statusAkun?: unknown };
  const statusAkun = body.statusAkun;
  if (statusAkun !== "AKTIF" && statusAkun !== "SUSPEND") {
    return NextResponse.json({ error: "Status akun tidak valid." }, { status: 400 });
  }

  const diperbarui = await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { statusAkun: statusAkun as StatusAkun } }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: statusAkun === "SUSPEND" ? "user.suspend" : "user.aktivasi",
        entitasTipe: "User",
        entitasId: target.id,
        dataSebelum: { statusAkun: target.statusAkun },
        dataSesudah: { statusAkun },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, email: target.email, statusAkun: diperbarui[0].statusAkun });
}