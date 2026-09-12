import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { verifikasiRecaptcha } from "@/lib/recaptcha";

/**
 * POST /api/komentar — terima komentar publik artikel (blueprint 8.3).
 * - Kader yang login: identitas dari akun (perlu permission komentar.buat).
 * - Pengunjung: wajib nama (3–80) + token reCAPTCHA v3.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      nama?: string;
      isi?: string;
      recaptchaToken?: string;
    };

    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

    const artikel = await prisma.artikel.findFirst({
      where: { slug, status: "TERBIT" },
      select: { id: true },
    });
    if (!artikel) {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

    const isi = body.isi?.trim();
    if (!isi || isi.length < 3) {
      return NextResponse.json({ error: "Isi komentar minimal 3 karakter." }, { status: 400 });
    }
    if (isi.length > 1500) {
      return NextResponse.json({ error: "Komentar maksimal 1.500 karakter." }, { status: 400 });
    }

    // Identitas: kader login → akun; pengunjung → nama publik.
    const user = await getSessionUser();
    let penulisId: string | null = null;
    let namaTamu: string | null = null;
    if (user?.id) {
      if (!user.permissions.includes("komentar.buat")) {
        return NextResponse.json(
          { error: "Akun Anda tidak memiliki izin berkomentar." },
          { status: 403 },
        );
      }
      penulisId = user.id;
    } else {
      const nama = body.nama?.trim() ?? "";
      if (nama.length < 3 || nama.length > 80) {
        return NextResponse.json(
          { error: "Nama pengunjung wajib diisi (3–80 karakter)." },
          { status: 400 },
        );
      }
      namaTamu = nama;
    }

    // Perlindungan anti-bot (blueprint 8.3 & 14).
    const lolos = await verifikasiRecaptcha(
      body.recaptchaToken ?? "",
      "komentar",
      request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"),
    );
    if (!lolos) {
      return NextResponse.json(
        { error: "Verifikasi anti-bot gagal. Silakan muat ulang lalu coba lagi." },
        { status: 400 },
      );
    }

    const [komentar] = await prisma.$transaction([
      prisma.komentar.create({
        data: {
          artikelId: artikel.id,
          ...(penulisId ? { penulisId } : { namaTamu }),
          isi,
          verifikasiVia: process.env.RECAPTCHA_SECRET_KEY ? "recaptcha_v3" : null,
        },
      }),
      prisma.artikel.update({
        where: { id: artikel.id },
        data: { jumlahKomentar: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ ok: true, id: komentar.id });
  } catch (error) {
    console.error("[komentar] Gagal mengirim:", error);
    return NextResponse.json({ error: "Gagal mengirim komentar." }, { status: 500 });
  }
}