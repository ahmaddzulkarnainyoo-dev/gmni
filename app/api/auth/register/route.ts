import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ROLE_KONTRIBUTOR = "Kontributor";

/**
 * Registrasi kader berbasis Invite Token (blueprint 6.3 / 11 Fase 1).
 * - token divalidasi dari kolom tokenUndangan milik kader AKTIF.
 * - akun baru dibuat dengan role default Kontributor.
 * - token bersifat sekali pakai (dikosongkan setelah berhasil).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      namaLengkap?: string;
      username?: string;
      email?: string;
      password?: string;
    };

    const token = body.token?.trim();
    const namaLengkap = body.namaLengkap?.trim();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!token || !namaLengkap || !username || !email || !password) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak lengkap. Isi seluruh kolom." },
        { status: 400 },
      );
    }
    if (!/^[a-z0-9_.]{3,24}$/i.test(username)) {
      return NextResponse.json(
        { error: "Username hanya boleh huruf, angka, titik, garis bawah (3-24 karakter)." },
        { status: 400 },
      );
    }
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Sandi minimal 12 karakter demi keamanan kader." },
        { status: 400 },
      );
    }

    const pengundang = await prisma.user.findUnique({
      where: { tokenUndangan: token },
    });
    // Hanya kader AKTIF yang boleh mengundang.
    if (!pengundang || pengundang.statusAkun !== "AKTIF") {
      return NextResponse.json(
        { error: "Token undangan tidak valid atau sudah dipakai." },
        { status: 400 },
      );
    }

    const [emailAda, usernameAda] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);
    if (emailAda || usernameAda) {
      return NextResponse.json(
        { error: "Email atau username sudah terdaftar. Gunakan lainnya." },
        { status: 409 },
      );
    }

    const role = await prisma.role.findUnique({ where: { nama: ROLE_KONTRIBUTOR } });
    if (!role) {
      return NextResponse.json(
        { error: "Role Kontributor belum tersedia di database." },
        { status: 500 },
      );
    }

    const passwordHash = await hash(password, 12);

    // Simpan kader baru + kosongkan token pengundang (sekali pakai).
    const [, kader] = await prisma.$transaction([
      prisma.user.update({
        where: { id: pengundang.id },
        data: { tokenUndangan: null },
      }),
      prisma.user.create({
        data: {
          namaLengkap,
          username,
          email,
          passwordHash,
          roleId: role.id,
          diundangOlehId: pengundang.id,
        },
      }),
    ]);

    console.log(`[registrasi] Kader baru terdaftar: ${kader.email} (diundang: ${pengundang.email})`);
    return NextResponse.json({ ok: true, email: kader.email });
  } catch (error) {
    console.error("[registrasi] Gagal:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Coba beberapa saat lagi." },
      { status: 500 },
    );
  }
}