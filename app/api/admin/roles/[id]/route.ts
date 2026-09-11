import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

/** Menyimpan ulang daftar Permission untuk sebuah Role (tanpa ubah kode). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requirePermission("role.kelola");

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
  }

  const body = (await request.json()) as { permissionKodes?: unknown };
  if (!Array.isArray(body.permissionKodes)) {
    return NextResponse.json({ error: "Daftar izin tidak valid." }, { status: 400 });
  }

  const kodeUsulan: string[] = [...new Set(body.permissionKodes.filter((k) => typeof k === "string"))];
  const permissionTerdaftar = await prisma.permission.findMany({
    where: { kode: { in: kodeUsulan } },
    select: { id: true, kode: true },
  });

  const kodeLama = await prisma.rolePermission.findMany({
    where: { roleId: id },
    select: { permission: { select: { kode: true } } },
  });

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    ...permissionTerdaftar.map((p) =>
      prisma.rolePermission.create({ data: { roleId: id, permissionId: p.id } }),
    ),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: "role.update_permission",
        entitasTipe: "Role",
        entitasId: role.id,
        dataSebelum: { kode: kodeLama.map((k) => k.permission.kode) },
        dataSesudah: { kode: permissionTerdaftar.map((p) => p.kode) },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    nama: role.nama,
    permissionKodes: permissionTerdaftar.map((p) => p.kode),
  });
}