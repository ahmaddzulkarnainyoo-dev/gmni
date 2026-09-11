import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { slugArtikelUnik } from "@/lib/slug";
import { mdKeHtml } from "@/lib/markdown";
import type { VisibilitasPenulis } from "@prisma/client";

const PILIHAN_VISIBILITAS: VisibilitasPenulis[] = ["ASLI", "SAMARAN", "REDAKSI"];

/** Membuat artikel baru: DRAFT, atau langsung DIAJUKAN ke redaksi. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Harus masuk terlebih dahulu." }, { status: 401 });
  }
  if (!user.permissions.includes("artikel.buat")) {
    return NextResponse.json({ error: "Tidak punya izin menulis artikel." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      judul?: string;
      ringkasan?: string;
      konten?: string;
      kategoriId?: string;
      tagIds?: string[];
      visibilitasPenulis?: VisibilitasPenulis;
      namaTampilanKustom?: string | null;
      ajukan?: boolean;
    };

    const judul = body.judul?.trim();
    const konten = body.konten?.trim();
    const kategoriId = body.kategoriId;
    const visibilitas: VisibilitasPenulis | undefined = PILIHAN_VISIBILITAS.includes(
      body.visibilitasPenulis as VisibilitasPenulis,
    )
      ? (body.visibilitasPenulis as VisibilitasPenulis)
      : "ASLI";

    if (!judul || judul.length < 8) {
      return NextResponse.json({ error: "Judul minimal 8 karakter." }, { status: 400 });
    }
    if (!konten || konten.length < 40) {
      return NextResponse.json({ error: "Isi artikel minimal 40 karakter." }, { status: 400 });
    }
    if (visibilitas === "SAMARAN" && !body.namaTampilanKustom?.trim()) {
      return NextResponse.json(
        { error: "Nama samaran wajib diisi saat memilih Visibilitas Penulis Samaran." },
        { status: 400 },
      );
    }
    const kategoriAda = await prisma.kategori.findUnique({ where: { id: kategoriId } });
    if (!kategoriAda || !kategoriId) {
      return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 400 });
    }

    const bermintaSubmit = Boolean(body.ajukan);
    if (bermintaSubmit && !user.permissions.includes("artikel.submit")) {
      return NextResponse.json({ error: "Tidak punya izin mengajukan ke redaksi." }, { status: 403 });
    }

    const tagIds = Array.isArray(body.tagIds)
      ? [...new Set(body.tagIds.filter((t) => typeof t === "string"))].slice(0, 5)
      : [];

    const slug = await slugArtikelUnik(judul);
    const namaSamaran = visibilitas === "SAMARAN" ? body.namaTampilanKustom!.trim() : null;
    const kontenHtml = mdKeHtml(konten);

    const artikel = await prisma.artikel.create({
      data: {
        judul,
        slug,
        ringkasan: body.ringkasan?.trim() || null,
        konten: kontenHtml,
        kategoriId,
        penulisId: user.id,
        visibilitasPenulis: visibilitas,
        namaTampilanKustom: namaSamaran,
        // Prinsip anonimitas (blueprint 6.2): samaran DILARANG masuk gamifikasi.
        dikecualikanDariLeaderboard: visibilitas === "SAMARAN",
        status: bermintaSubmit ? "DIAJUKAN" : "DRAFT",
        tanggalDiajukan: bermintaSubmit ? new Date() : null,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });

    return NextResponse.json({ ok: true, id: artikel.id, slug: artikel.slug, status: artikel.status });
  } catch (error) {
    console.error("[artikel] Gagal membuat:", error);
    return NextResponse.json({ error: "Gagal menyimpan artikel." }, { status: 500 });
  }
}