import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validasiDonasi } from "@/lib/monetisasi";

/**
 * POST /api/donasi — donasi publik (tanpa login, v1 tanpa reCAPTCHA).
 * Masuk sebagai MENUNGGU_VERIFIKASI; tampil publik hanya setelah diverifikasi.
 */
export async function POST(request: Request) {
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
