import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import {
  MASA_PEMULIHAN_ADMIN_JAM,
  tokenPemulihanBaru,
  urlDasar,
} from "@/lib/pemulihan";

/**
 * POST /api/admin/pengguna/[id]/reset-sandi — pintu darurat tanpa email:
 * admin membuat tautan pemulihan sekali pakai (24 jam) dan membagikannya
 * sendiri ke kader (WA/email pribadi). Butuh permission "pengguna.suspend".
 * Body kosong. Respons berisi `tautan` — TIDAK disimpan di log aplikasi.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requirePermission("pengguna.suspend");

  if (id === user.id) {
    return NextResponse.json(
      { error: "Gunakan halaman pengaturan untuk mengubah sandi akun sendiri." },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, statusAkun: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Kader tidak ditemukan." }, { status: 404 });
  }

  const token = tokenPemulihanBaru();
  const kedaluwarsaAt = new Date(
    Date.now() + MASA_PEMULIHAN_ADMIN_JAM * 60 * 60 * 1000,
  );
  try {
    await prisma.$transaction([
      prisma.tokenPemulihan.deleteMany({
        where: { userId: target.id, dipakaiAt: null },
      }),
      prisma.tokenPemulihan.create({
        data: {
          userId: target.id,
          token,
          kedaluwarsaAt,
          dibuatOlehId: user.id,
        },
      }),
      prisma.auditLog.create({
        data: {
          aktorId: user.id,
          aksi: "user.reset_sandi_admin",
          entitasTipe: "User",
          entitasId: target.id,
          dataSesudah: {
            email: target.email,
            kedaluwarsaJam: MASA_PEMULIHAN_ADMIN_JAM,
          },
        },
      }),
    ]);
  } catch (error) {
    console.error("[reset-sandi] Gagal membuat token:", error);
    return NextResponse.json(
      { error: "Gagal membuat tautan pemulihan." },
      { status: 500 },
    );
  }

  const tautan = `${urlDasar(request)}/pulihkan-sandi?token=${token}`;
  return NextResponse.json({
    ok: true,
    email: target.email,
    tautan,
    kedaluwarsaJam: MASA_PEMULIHAN_ADMIN_JAM,
  });
}