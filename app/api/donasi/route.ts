import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validasiDonasi } from "@/lib/monetisasi";

/**
 * POST /api/donasi — donasi publik (tanpa login, v1 tanpa reCAPTCHA).
 * Masuk sebagai MENUNGGU_VERIFIKASI; tampil publik hanya setelah diverifikasi.
 * Rate-limit in-memory: maks 5 kiriman per IP tiap 60 detik (anti-spam).
 */

const JENDELA_MS = 60 * 1000;
const MAKS_PER_JENDELA = 5;
const kirimanIp = new Map<string, number[]>();

function alamatIp(request: Request): string {
  const header =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim();
  return header && header.length > 0 ? header : "tanpa-ip";
}

function lewatBatas(ip: string): boolean {
  const sekarang = Date.now();
  const riwayat = (kirimanIp.get(ip) ?? []).filter(
    (t) => sekarang - t < JENDELA_MS,
  );
  if (riwayat.length >= MAKS_PER_JENDELA) {
    kirimanIp.set(ip, riwayat);
    return false;
  }
  riwayat.push(sekarang);
  kirimanIp.set(ip, riwayat);
  // Penyisihan berkala (best-effort) agar Map tidak tumbuh tanpa batas.
  if (kirimanIp.size > 5000) {
    for (const [k, v] of kirimanIp) {
      if (v.every((t) => sekarang - t >= JENDELA_MS)) kirimanIp.delete(k);
    }
  }
  return true;
}

export async function POST(request: Request) {
  if (!lewatBatas(alamatIp(request))) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const namaDonatur = typeof body.namaDonatur === "string" ? body.namaDonatur.trim() : "";
  const nominal =
    typeof body.nominal === "number"
      ? Math.trunc(body.nominal)
      : Number.isFinite(Number(body.nominal))
        ? Math.trunc(Number(body.nominal))
        : NaN;
  const pesan =
    typeof body.pesan === "string" && body.pesan.trim().length > 0
      ? body.pesan.trim()
      : null;

  const eror = validasiDonasi({ namaDonatur, nominal, pesan });
  if (eror) return NextResponse.json({ error: eror }, { status: 400 });

  try {
    const donasi = await prisma.donasi.create({
      data: { namaDonatur, nominal, pesan },
      select: { id: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, id: donasi.id }, { status: 201 });
  } catch (error) {
    console.error("[donasi] Gagal mencatat donasi:", error);
    return NextResponse.json({ error: "Gagal mencatat donasi." }, { status: 500 });
  }
}
