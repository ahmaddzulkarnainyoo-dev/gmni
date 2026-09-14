import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ROLE_KONTRIBUTOR = "Kontributor";

// Rate-limit in-memory pendaftaran terbuka (Q5): maks 1 kiriman per IP
// tiap 60 detik — cukup untuk portal kader tanpa dependensi eksternal.
const BATAS_DETIK = 60;
const kirimanTerakhir = new Map<string, number>();

function alamatIpDari(request: Request): string {
  const header =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim();
  return header && header.length > 0 ? header : "tanpa-ip";
}

function lewatBatas(ip: string): boolean {
  const sekarang = Date.now();
  const terakhir = kirimanTerakhir.get(ip) ?? 0;
  if (sekarang - terakhir < BATAS_DETIK * 1000) return false;
  kirimanTerakhir.set(ip, sekarang);
  return true;
}

function validasiPendaftaran(
  namaLengkap: string | undefined,
  username: string | undefined,
  email: string | undefined,
  password: string,
  cabangKomisariat: string | undefined,
): string | null {
  if (!namaLengkap || !username || !email || !password || !cabangKomisariat) {
    return "Data pendaftaran tidak lengkap. Isi seluruh kolom.";
  }
  if (namaLengkap.length < 3 || namaLengkap.length > 100) {
    return "Nama lengkap 3-100 karakter.";
  }
  if (!/^[a-z0-9_.]{3,24}$/i.test(username)) {
    return "Username hanya boleh huruf, angka, titik, garis bawah (3-24 karakter).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Format email tidak valid.";
  }
  if (password.length < 12) {
    return "Sandi minimal 12 karakter demi keamanan kader.";
  }
  if (cabangKomisariat.length < 3 || cabangKomisariat.length > 120) {
    return "Cabang/komisariat 3-120 karakter.";
  }
  return null;
}

async function pastikanBelumTerdaftar(
  email: string,
  username: string,
): Promise<string | null> {
  const [emailAda, usernameAda] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);
  if (emailAda || usernameAda) {
    return "Email atau username sudah terdaftar. Gunakan lainnya.";
  }
  return null;
}

/**
 * Pendaftaran kader — dua mode:
 * 1. Invite legacy (blueprint 6.3): `token` sah dari kader AKTIF →
 *    akun langsung AKTIF, token sekali pakai (retained 100%).
 * 2. Pendaftaran terbuka: tanpa token → akun PENDING, wajib verifikasi
 *    Admin Redaksi di /admin/pengguna sebelum bisa login.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      namaLengkap?: string;
      username?: string;
      email?: string;
      password?: string;
      cabangKomisariat?: string;
    };

    const token = body.token?.trim() || null;
    const namaLengkap = body.namaLengkap?.trim();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const cabangKomisariat = body.cabangKomisariat?.trim();

    const erorValidasi = validasiPendaftaran(
      namaLengkap,
      username,
      email,
      password,
      cabangKomisariat,
    );
    if (erorValidasi || !namaLengkap || !username || !email || !cabangKomisariat) {
      return NextResponse.json(
        { error: erorValidasi ?? "Data pendaftaran tidak lengkap." },
        { status: 400 },
      );
    }

    if (!lewatBatas(alamatIpDari(request))) {
      return NextResponse.json(
        { error: "Terlalu sering mendaftar. Tunggu sebentar lalu coba lagi." },
        { status: 429 },
      );
    }

    const erorUnik = await pastikanBelumTerdaftar(email, username);
    if (erorUnik) {
      return NextResponse.json({ error: erorUnik }, { status: 409 });
    }

    const pengundang = token
      ? await prisma.user.findUnique({ where: { tokenUndangan: token } })
      : null;
    // Mode invite: hanya kader AKTIF yang boleh mengundang.
    if (token && (!pengundang || pengundang.statusAkun !== "AKTIF")) {
      return NextResponse.json(
        { error: "Token undangan tidak valid atau sudah dipakai." },
        { status: 400 },
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

    // Mode invite legacy: kader baru langsung AKTIF + token pengundang
    // dikosongkan (sekali pakai).
    if (pengundang) {
      const [, kaderUndang] = await prisma.$transaction([
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
            cabangKomisariat,
            roleId: role.id,
            diundangOlehId: pengundang.id,
          },
        }),
      ]);

      console.log(
        `[registrasi] Kader baru terdaftar (undang): ${kaderUndang.email} (diundang: ${pengundang.email})`,
      );
      return NextResponse.json({ ok: true, email: kaderUndang.email, mode: "undang" });
    }

    // Mode pendaftaran terbuka: akun PENDING, menunggu verifikasi admin.
    const kader = await prisma.user.create({
      data: {
        namaLengkap,
        username,
        email,
        passwordHash,
        cabangKomisariat,
        roleId: role.id,
        statusAkun: "PENDING",
      },
    });
    await prisma.auditLog
      .create({
        data: {
          aktorId: null,
          aksi: "user.daftar_pending",
          entitasTipe: "User",
          entitasId: kader.id,
          dataSesudah: { email, username, cabangKomisariat },
        },
      })
      .catch(() => undefined);

    console.log(`[registrasi] Pendaftar baru menunggu verifikasi: ${kader.email}`);
    return NextResponse.json({ ok: true, email: kader.email, mode: "verifikasi" });
  } catch (error) {
    console.error("[registrasi] Gagal:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Coba beberapa saat lagi." },
      { status: 500 },
    );
  }
}