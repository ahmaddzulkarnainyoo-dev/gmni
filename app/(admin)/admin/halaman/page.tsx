import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PanelHalaman } from "@/components/admin/PanelHalaman";

export const metadata: Metadata = { title: "Halaman Statis" };
export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  await requirePermission("halaman_statis.edit");

  const halaman = await prisma.halamanStatis.findMany({ orderBy: { slug: "asc" } });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Halaman Statis
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Redaksi dapat mengelola konten tanpa developer. Perubahan langsung
          tampil di rute publik.
        </p>
      </div>
      <PanelHalaman
        halaman={halaman.map((h) => ({ slug: h.slug, judul: h.judul, konten: h.konten }))}
      />
    </div>
  );
}