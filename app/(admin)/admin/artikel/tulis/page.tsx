import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FormArtikelAdmin } from "@/components/admin/FormArtikelAdmin";

export const metadata: Metadata = { title: "Tulis Artikel — Admin" };
export const dynamic = "force-dynamic";

export default async function HalamanTulisArtikelAdmin() {
  await requirePermission("artikel.buat");

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
        buat
        kategori={kategori}
        tags={tags}
        penulis={penulis}
      />
    </div>
  );
}