import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { mdKeHtml } from "@/lib/markdown";
import { slugify } from "@/lib/slug";

/** POST /api/admin/halaman — buat halaman statis baru (Super Admin/Editor). Input Markdown, tersimpan HTML aman. */
export async function POST(request: Request) {
  const user = await requirePermission("halaman_statis.edit");

  const body = (await request.json()) as { judul?: unknown; slug?: unknown; konten?: unknown };
  const judul = typeof body.judul === "string" ? body.judul.trim() : "";
  const konten = typeof body.konten === "string" ? body.konten.trim() : "";
  if (!judul) {
    return NextResponse.json({ error: "Judul halaman wajib diisi." }, { status: 400 });
  }
  if (!konten) {
    return NextResponse.json({ error: "Konten halaman wajib diisi." }, { status: 400 });
  }
  const kontenHtml = mdKeHtml(konten);

  const slugUsulan =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim().toLowerCase()
      : slugify(judul);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugUsulan)) {
    return NextResponse.json(
      { error: "Slug hanya huruf kecil, angka, dan tanda hubung." },
      { status: 400 },
    );
  }
  const bentrok = await prisma.halamanStatis.findUnique({ where: { slug: slugUsulan } });
  if (bentrok) {
    return NextResponse.json({ error: "Slug halaman sudah dipakai." }, { status: 409 });
  }

  const dibuat = await prisma.$transaction([
    prisma.halamanStatis.create({
      data: { slug: slugUsulan, judul, konten: kontenHtml, terakhirDiubahOlehId: user.id },
    }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: "halaman.create",
        entitasTipe: "HalamanStatis",
        entitasId: slugUsulan,
        dataSesudah: { judul, slug: slugUsulan },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, slug: dibuat[0].slug });
}