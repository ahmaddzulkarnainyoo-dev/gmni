import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PanelTag } from "@/components/admin/PanelTag";

export const metadata: Metadata = { title: "Tag" };
export const dynamic = "force-dynamic";

export default async function HalamanTagAdmin() {
  await requireRole("Super Admin", "Editor");

  const [tags, totalArtikel] = await Promise.all([
    prisma.tag.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, slug: true },
    }),
    prisma.artikelTag.groupBy({ by: ["tagId"], _count: { _all: true } }),
  ]);

  const hitung = new Map<string, number>();
  for (const baris of totalArtikel) hitung.set(baris.tagId, baris._count._all);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Tag
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Label lintas-kanal untuk penanda artikel (blueprint 7.4).
        </p>
      </div>
      <PanelTag
        tags={tags.map((t) => ({
          id: t.id,
          nama: t.nama,
          slug: t.slug,
          jumlahArtikel: hitung.get(t.id) ?? 0,
        }))}
      />
    </div>
  );
}