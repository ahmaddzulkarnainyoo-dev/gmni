import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PanelPengguna } from "@/components/admin/PanelPengguna";

export const metadata: Metadata = { title: "Pengguna & Undangan" };
export const dynamic = "force-dynamic";

export default async function HalamanPenggunaAdmin() {
  const user = await requirePermission("pengguna.undang", "pengguna.suspend");

  const daftar = await prisma.user.findMany({
    orderBy: { tanggalBergabung: "desc" },
    select: {
      id: true,
      namaLengkap: true,
      email: true,
      username: true,
      statusAkun: true,
      tokenUndangan: true,
      tanggalBergabung: true,
      role: { select: { nama: true } },
      diundangOleh: { select: { email: true } },
    },
  });

  const data = daftar.map((u) => ({
    id: u.id,
    namaLengkap: u.namaLengkap,
    email: u.email,
    username: u.username,
    statusAkun: u.statusAkun,
    roleNama: u.role.nama,
    tokenUndangan: u.tokenUndangan,
    diundangOlehEmail: u.diundangOleh?.email ?? null,
    tanggalBergabung: u.tanggalBergabung.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Pengguna & Undangan
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Kelola akun kader, buat tautan undangan sekali pakai, dan tangguhkan
          akun bila diperlukan.
        </p>
      </div>
      <PanelPengguna
        pengguna={data}
        bisaUndang={user.permissions.includes("pengguna.undang")}
        bisaSuspend={user.permissions.includes("pengguna.suspend")}
      />
    </div>
  );
}