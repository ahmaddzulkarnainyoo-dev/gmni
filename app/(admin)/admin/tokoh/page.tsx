import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PanelTokoh } from "@/components/admin/PanelTokoh";

export const metadata: Metadata = { title: "Tokoh" };
export const dynamic = "force-dynamic";

export default async function HalamanTokohAdmin() {
  await requireRole("Super Admin", "Editor");

  const tokoh = await prisma.tokoh.findMany({
    orderBy: [{ urutan: "asc" }, { nama: "asc" }],
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Tokoh
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Kelola profil tokoh Marhaenis & alumni kader yang tampil di /tokoh.
        </p>
      </div>
      <PanelTokoh
        tokoh={tokoh.map((t) => ({
          id: t.id,
          nama: t.nama,
          slug: t.slug,
          julukan: t.julukan,
          gambar: t.gambar,
          biografi: t.biografi,
          kutipan: t.kutipan,
          lahir: t.lahir,
          wafat: t.wafat,
          status: t.status,
          urutan: t.urutan,
        }))}
      />
    </div>
  );
}