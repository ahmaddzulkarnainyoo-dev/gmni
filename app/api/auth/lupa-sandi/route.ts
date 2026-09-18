import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  MASA_PEMULIHAN_MENIT,
  kirimEmailPemulihan,
  tokenPemulihanBaru,
  urlDasar,
} from "@/lib/pemulihan";

/**
 * POST /api/auth/lupa-sandi — minta tautan pemulihan sandi.
 * Anti-enumeration: respons selalu sama (ok + pesan generik) baik email
 * terdaftar maupun tidak. Token: sekali pakai, 30 menit. Email dikirim via
 * Resend bila RESEND_API_KEY diset; tanpa key → tautan ke log server
 * (admin juga bisa membuat tautan manual dari /admin/pengguna).
 */
const PESAN_GENERIK =
  "Jika email terdaftar, tautan pemulihan telah dikirim. Periksa folder " +
  "spam; bila tidak menerima dalam 30 menit, hubungi Admin Redaksi atau " +
  "minta tautan baru.";

// Rate-limit in-memory: maks 5 permintaan per IP tiap 60 detik.
const BATAS_MENIT = 60;
const MAKS_KIRIMAN = 5;
const kiriman = new Map<string, number[]>();

function alamatIp(request: Request): string {
  const header =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim();
  return header && header.length > 0 ? header : "tanpa-ip";
}

function lewatBatas(ip: string): boolean {
  const sekarang = Date.now();
  const riwayat = (kiriman.get(ip) ?? []).filter(
    (t) => sekarang - t < BATAS_MENIT * 1000,
  );
  if (riwayat.length >= MAKS_KIRIMAN) {
    kiriman.set(ip, riwayat);
    return false;
  }
  riwayat.push(sekarang);
  kiriman.set(ip, riwayat);
  return true;
}

export async function POST(request: Request) {
  if (!lewatBatas(alamatIp(request))) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi dalam satu menit." },
      { status: 429 },
    );
  }

  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email !== "string") throw new Error("kosong");
    email = body.email.trim().toLowerCase();
  } catch {
    // Tetap balas generik agar tidak membocorkan bentuk payload.
    return NextResponse.json({ ok: true, pesan: PESAN_GENERIK });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: true, pesan: PESAN_GENERIK });
  }

  try {
    const pengguna = await prisma.user.findUnique({
      where: { email },
      select: { id: true, statusAkun: true },
    });

    if (pengguna && pengguna.statusAkun === "AKTIF") {
      const token = tokenPemulihanBaru();
      const kedaluwarsaAt = new Date(
        Date.now() + MASA_PEMULIHAN_MENIT * 60 * 1000,
      );
      await prisma.$transaction([
        // Maksimal satu tautan aktif per akun — token lama yang belum
        // dipakai dicabut (menghindari penumpukan token rentan).
        prisma.tokenPemulihan.deleteMany({
          where: { userId: pengguna.id, dipakaiAt: null },
        }),
        prisma.tokenPemulihan.create({
          data: { userId: pengguna.id, token, kedaluwarsaAt },
        }),
      ]);
      // Audit terpisah (best-effort) agar kegagalannya tidak menggagalkan token.
      await prisma.auditLog
        .create({
          data: {
            aktorId: null,
            aksi: "user.minta_pulihkan_sandi",
            entitasTipe: "User",
            entitasId: pengguna.id,
            dataSesudah: { email, kedaluwarsaMenit: MASA_PEMULIHAN_MENIT },
          },
        })
        .catch(() => undefined);

      const tautan = `${urlDasar(request)}/pulihkan-sandi?token=${token}`;
      const hasil = await kirimEmailPemulihan(email, tautan);
      if (hasil === "tanpa_key") {
        console.log(
          `[pemulihan] RESEND_API_KEY belum diset — tautan pemulihan untuk ${email} (berlaku ${MASA_PEMULIHAN_MENIT} mnt): ${tautan}`,
        );
      } else if (hasil === "gagal") {
        console.log(
          `[pemulihan] Email gagal terkirim — tautan untuk ${email}: ${tautan}`,
        );
      }
    }
  } catch (error) {
    console.error("[pemulihan] Gagal memproses permintaan:", error);
  }

  return NextResponse.json({ ok: true, pesan: PESAN_GENERIK });
}