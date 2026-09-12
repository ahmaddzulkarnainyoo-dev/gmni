import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FormArtikelAdmin } from "@/components/admin/FormArtikelAdmin";

export const metadata: Metadata = { title: "Edit Artikel — Admin" };
export const dynamic = "force-dynamic";

export default async function HalamanEditArtikelAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("artikel.publish");
  const { id } = await params;

  const artikel = await prisma.artikel.findUnique({
    where: { id },
    include: { tags: { select: { tagId: true } } },
  });
  if (!artikel) notFound();

  const [kategori, tags, penulis] = await Promise.all([
    prisma.kategori.findMany({ orderBy: [{ isTetap: "desc" }, { nama: "asc" }] }),
    prisma.tag.findMany({ orderBy: { nama: "asc" } }),
    prisma.user.findMany({
      where: { statusAkun: "AKTIF" },
      orderBy: { namaLengkap: "asc" },
      select: { id: true, namaLengkap: true, username: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <FormArtikelAdmin
        buat={false}
        artikel={{
          id: artikel.id,
          judul: artikel.judul,
          slug: artikel.slug,
          ringkasan: artikel.ringkasan,
          konten: artikel.konten,
          gambarUtama: artikel.gambarUtama,
          kategoriId: artikel.kategoriId,
          status: artikel.status,
          visibilitasPenulis: artikel.visibilitasPenulis,
          namaTampilanKustom: artikel.namaTampilanKustom,
          disematkan: artikel.disematkan,
          tanggalDijadwalkan: artikel.tanggalDijadwalkan,
          tagIds: artikel.tags.map((t) => t.tagId),
          penulisId: artikel.penulisId,
        }}
        kategori={kategori}
        tags={tags}
        penulis={penulis}
      />
    </div>
  );
}