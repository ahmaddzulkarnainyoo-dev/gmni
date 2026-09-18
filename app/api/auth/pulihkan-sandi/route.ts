import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/pulihkan-sandi — konsumsi token pemulihan + set sandi baru.
 * Token: sekali pakai, berlaku 30 menit (buat admin: 24 jam). Akun SUSPEND/
 * PENDING tidak boleh memulihkan lewat tautan (gate statusAkun AKTIF).
 */
export async function POST(request: Request) {
  let token = "";
  let sandiBaru = "";
  let konfirmasi = "";
  try {
    const body = (await request.json()) as {
      token?: unknown;
      sandiBaru?: unknown;
      konfirmasi?: unknown;
    };
    token = typeof body.token === "string" ? body.token.trim() : "";
    sandiBaru = typeof body.sandiBaru === "string" ? body.sandiBaru : "";
    konfirmasi = typeof body.konfirmasi === "string" ? body.konfirmasi : "";
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json(
      { error: "Tautan pemulihan tidak valid." },
      { status: 400 },
    );
  }
  if (sandiBaru.length < 12) {
    return NextResponse.json(
      { error: "Sandi minimal 12 karakter demi keamanan kader." },
      { status: 400 },
    );
  }
  if (sandiBaru !== konfirmasi) {
    return NextResponse.json(
      { error: "Konfirmasi sandi tidak sama." },
      { status: 400 },
    );
  }

  try {
    const rekaman = await prisma.tokenPemulihan.findUnique({
      where: { token },
      select: {
        id: true,
        dipakaiAt: true,
        kedaluwarsaAt: true,
        user: { select: { id: true, email: true, statusAkun: true } },
      },
    });
    const tidakSah =
      !rekaman ||
      rekaman.dipakaiAt !== null ||
      rekaman.kedaluwarsaAt < new Date() ||
      rekaman.user.statusAkun !== "AKTIF";
    if (tidakSah) {
      return NextResponse.json(
        {
          error:
            "Tautan pemulihan tidak valid atau sudah kedaluwarsa. Minta tautan baru di halaman lupa sandi.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await hash(sandiBaru, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: rekaman.user.id },
        data: { passwordHash },
      }),
      prisma.tokenPemulihan.update({
        where: { id: rekaman.id },
        data: { dipakaiAt: new Date() },
      }),
      prisma.tokenPemulihan.deleteMany({
        where: { userId: rekaman.user.id, dipakaiAt: null },
      }),
      prisma.auditLog.create({
        data: {
          aktorId: rekaman.user.id,
          aksi: "user.pulihkan_sandi",
          entitasTipe: "User",
          entitasId: rekaman.user.id,
          dataSesudah: { email: rekaman.user.email },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      pesan: "Sandi berhasil diperbarui. Silakan masuk dengan sandi baru.",
    });
  } catch (error) {
    console.error("[pulihkan-sandi] Gagal:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Coba beberapa saat lagi." },
      { status: 500 },
    );
  }
}