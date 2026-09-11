import type { Metadata } from "next";
import type { StatusArtikel } from "@prisma/client";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FormArtikel } from "@/components/dasbor/FormArtikel";

export const metadata: Metadata = { title: "Tulis Artikel" };

/** Dinamis: bergantung sesi kader & data draf. */
export const dynamic = "force-dynamic";

export default async function HalamanTulis({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await requirePermission("artikel.buat");
  const { id } = await searchParams;

  const [kategori, tags] = await Promise.all([
    prisma.kategori.findMany({ orderBy: [{ isTetap: "desc" }, { nama: "asc" }] }),
    prisma.tag.findMany({ orderBy: { nama: "asc" } }),
  ]);

  let artikel:
    | {
        id: string;
        judul: string;
        ringkasan: string | null;
        konten: string;
        kategoriId: string;
        visibilitasPenulis: "ASLI" | "SAMARAN" | "REDAKSI";
        namaTampilanKustom: string | null;
        status: StatusArtikel;
        catatanRevisi: string | null;
        tagIds: string[];
      }
    | null = null;

  if (id) {
    const draf = await prisma.artikel.findUnique({
      where: { id },
      include: { tags: { select: { tagId: true } } },
    });
    if (
      draf &&
      draf.penulisId === user.id &&
      (draf.status === "DRAFT" || draf.status === "DIMINTA_REVISI")
    ) {
      artikel = {
        id: draf.id,
        judul: draf.judul,
        ringkasan: draf.ringkasan,
        konten: draf.konten,
        kategoriId: draf.kategoriId,
        visibilitasPenulis: draf.visibilitasPenulis,
        namaTampilanKustom: draf.namaTampilanKustom,
        status: draf.status,
        catatanRevisi: draf.catatanRevisi,
        tagIds: draf.tags.map((t) => t.tagId),
      };
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {artikel?.status === "DIMINTA_REVISI" && (
        <div className="mb-6 border-l-4 border-gmnimerah-500 bg-kertas-200 p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-700">
            Artikel Diminta Revisi
          </p>
          <p className="mt-1 text-sm text-hitam-700">
            Catatan redaksi: {artikel.catatanRevisi || "(tanpa catatan)"}
          </p>
        </div>
      )}
      <FormArtikel
        buat={!artikel}
        artikel={artikel ?? undefined}
        kategori={kategori}
        tags={tags}
      />
    </div>
  );
}