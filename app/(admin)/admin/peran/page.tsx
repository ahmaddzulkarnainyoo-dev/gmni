import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PengelolaRole } from "@/components/admin/PengelolaRole";

export const metadata: Metadata = { title: "Peran & Hak Akses" };
export const dynamic = "force-dynamic";

export default async function HalamanPeranAdmin() {
  const user = await requirePermission("role.kelola");

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        isSystemDefault: true,
        permissions: { select: { permission: { select: { kode: true } } } },
      },
    }),
    prisma.permission.findMany({ orderBy: { kode: "asc" } }),
  ]);

  const dataRole = roles.map((r) => ({
    id: r.id,
    nama: r.nama,
    deskripsi: r.deskripsi,
    isSystemDefault: r.isSystemDefault,
    permissionKodes: r.permissions.map((p) => p.permission.kode),
  }));
  const dataPermission = permissions.map((p) => ({ kode: p.kode, deskripsi: p.deskripsi }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Peran & Hak Akses
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Atur daftar izin setiap peran tanpa mengubah kode. Anda masuk
          sebagai: <strong className="text-hitam-900">{user.roleNama}</strong>.
        </p>
      </div>
      <PengelolaRole roles={dataRole} permissions={dataPermission} />
    </div>
  );
}