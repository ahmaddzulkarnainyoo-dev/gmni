import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

/**
 * Generator undangan global (blueprint 6.3): membuat tautan /daftar?token=…
 * sekali pakai yang TIDAK terikat ke kader tertentu — calon kader mendaftar
 * langsung AKTIF tanpa antrean verifikasi manual.
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission("pengguna.undang");

  const token = randomBytes(24).toString("hex");
  const undangan = await prisma.tokenUndangan.create({
    data: { token, dibuatOlehId: user.id },
  });

  await prisma.auditLog
    .create({
      data: {
        aktorId: user.id,
        aksi: "user.buat_undangan_global",
        entitasTipe: "TokenUndangan",
        entitasId: undangan.id,
        dataSesudah: { tokenDibuat: true },
      },
    })
    .catch(() => undefined);

  const origin = request.nextUrl.origin;
  const linkUndangan = `${origin}/daftar?token=${token}`;

  return NextResponse.json({ ok: true, linkUndangan, token });
}
