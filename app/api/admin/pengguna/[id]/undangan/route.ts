import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

/** Membuat token undangan kader (sekali pakai) untuk akun [id]. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requirePermission("pengguna.undang");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Kader tidak ditemukan." }, { status: 404 });
  }
  if (target.statusAkun !== "AKTIF") {
    return NextResponse.json({ error: "Hanya kader aktif yang dapat mengundang." }, { status: 400 });
  }

  const tokenUndangan = randomBytes(24).toString("hex");
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { tokenUndangan } }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: "user.buat_token_undangan",
        entitasTipe: "User",
        entitasId: target.id,
        dataSesudah: { tokenDibuat: true },
      },
    }),
  ]);

  const origin = request.nextUrl.origin;
  const linkUndangan = `${origin}/daftar?token=${tokenUndangan}`;

  return NextResponse.json({ ok: true, linkUndangan, token: tokenUndangan });
}