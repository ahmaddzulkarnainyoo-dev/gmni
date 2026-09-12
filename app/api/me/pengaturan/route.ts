import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

/**
 * PATCH /api/me/pengaturan — ubah preferensi akun sendiri.
 * Saat ini mendukung privasi "Sembunyikan profil dari pencarian & DM" (blueprint 6.2).
 */
export async function PATCH(request: Request) {
  const user = await requirePermission("profil.edit_sendiri");

  const body = (await request.json()) as { profilTersembunyi?: unknown };
  const profilTersembunyi = body.profilTersembunyi;
  if (typeof profilTersembunyi !== "boolean") {
    return NextResponse.json({ error: "Nilai pengaturan tidak valid." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { profilTersembunyi },
  });

  return NextResponse.json({ ok: true });
}