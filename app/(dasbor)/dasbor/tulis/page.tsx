import type { Metadata } from "next";
import type { StatusArtikel } from "@prisma/client";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { amanAsync } from "@/lib/kueri-aman";
import { FormArtikel } from "@/components/dasbor/FormArtikel";

/* Banner fallback bila query gagal (bukan error boundary). */
function BannerGagal() {
  return (
    <p
      role="alert"
      className="mb-4 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
    >
      Data redaksi belum dapat dimuat (kategori/tag/draf). Coba muat ulang
      halaman - tulisan Anda aman, form tetap bisa dibuka bila data kembali.
    </p>
  );
}

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

  const dimuat = await amanAsync(
    () =>
      Promise.all([
        prisma.kategori.findMany({ orderBy: [{ isTetap: "desc" }, { nama: "asc" }] }),
        prisma.tag.findMany({ orderBy: { nama: "asc" } }),
      ]),
    null as null | [Awaited<ReturnType<typeof prisma.kategori.findMany>>, Awaited<ReturnType<typeof prisma.tag.findMany>>],
  );

  if (!dimuat) {
    return (
      <div className="mx-auto max-w-4xl">
        <BannerGagal />
        <a
          href="/dasbor/tulis"
          className="border-2 border-hitam-900 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white"
        >
          Muat Ulang
        </a>
      </div>
    );
  }

  const [kategori, tags] = dimuat;

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
    const draf = await amanAsync(
      () =>
        prisma.artikel.findUnique({
          where: { id },
          include: { tags: { select: { tagId: true } } },
        }),
      null,
    );
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