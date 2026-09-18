import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

/**
 * PATCH /api/me/pengaturan — ubah preferensi akun sendiri.
 * Mendukung: privasi "Sembunyikan profil dari pencarian & DM" (blueprint 6.2)
 * dan foto profil (`fotoProfil`: URL http(s) ≤300 karakter, atau null untuk
 * menghapus). URL divalidasi sisi server — tidak ada HTML/JS injection.
 */
export async function PATCH(request: Request) {
  const user = await requirePermission("profil.edit_sendiri");

  const body = (await request.json().catch(() => null)) as {
    profilTersembunyi?: unknown;
    fotoProfil?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const data: { profilTersembunyi?: boolean; fotoProfil?: string | null } = {};

  if (body.profilTersembunyi !== undefined) {
    if (typeof body.profilTersembunyi !== "boolean") {
      return NextResponse.json({ error: "Nilai pengaturan tidak valid." }, { status: 400 });
    }
    data.profilTersembunyi = body.profilTersembunyi;
  }

  if (body.fotoProfil !== undefined) {
    if (body.fotoProfil === null) {
      data.fotoProfil = null;
    } else if (typeof body.fotoProfil === "string") {
      const url = body.fotoProfil.trim();
      let sah = false;
      try {
        const u = new URL(url);
        sah = (u.protocol === "https:" || u.protocol === "http:") && url.length <= 300;
      } catch {
        sah = false;
      }
      if (!sah) {
        return NextResponse.json(
          { error: "URL foto profil tidak valid (http/https, maks 300 karakter)." },
          { status: 400 },
        );
      }
      data.fotoProfil = url;
    } else {
      return NextResponse.json(
        { error: "URL foto profil tidak valid." },
        { status: 400 },
      );
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada pengaturan yang dikirim." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({ ok: true });
}