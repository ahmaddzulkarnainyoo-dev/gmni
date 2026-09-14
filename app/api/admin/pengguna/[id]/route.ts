import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import type { StatusAkun } from "@prisma/client";

/** Menangguhkan / mengaktifkan / memverifikasi akun kader (pengguna.suspend) /
 *  mengubah peran kader (role.kelola).
 *
 * Transisi status yang didukung:
 * - AKTIF → SUSPEND (tangguhkan) / SUSPEND → AKTIF (aktifkan)
 * - PENDING → AKTIF (setujui pendaftaran) / PENDING → SUSPEND (tolak)
 *
 * Ubah peran: body { roleId } — butuh permission "role.kelola"; tidak bisa
 * mengubah peran diri sendiri maupun peran Super Admin (proteksi redaksi).
 * Perubahan peran berlaku saat kader login berikutnya (permissions dibekukan
 * di token sesi saat login).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requirePermission("pengguna.suspend", "role.kelola");

  const target = await prisma.user.findUnique({
    where: { id },
    include: { role: { select: { id: true, nama: true } } },
  });
  if (!target) {
    return NextResponse.json({ error: "Kader tidak ditemukan." }, { status: 404 });
  }
  if (target.id === user.id) {
    return NextResponse.json(
      { error: "Tidak dapat mengubah status/peran akun sendiri." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    statusAkun?: unknown;
    roleId?: unknown;
  };

  // ---- Cabang ubah peran (role.kelola) ----
  if (body.roleId !== undefined) {
    if (body.statusAkun !== undefined) {
      return NextResponse.json(
        { error: "Kirim statusAkun atau roleId saja dalam satu permintaan." },
        { status: 400 },
      );
    }
    if (!user.permissions.includes("role.kelola")) {
      return NextResponse.json(
        { error: "Hanya pengelola peran yang dapat mengubah peran kader." },
        { status: 403 },
      );
    }
    if (typeof body.roleId !== "string" || body.roleId.trim() === "") {
      return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
    }
    if (target.role.nama === "Super Admin") {
      return NextResponse.json(
        { error: "Peran Super Admin dilindungi — hubungi pemilik sistem." },
        { status: 403 },
      );
    }
    const roleBaru = await prisma.role.findUnique({
      where: { id: body.roleId },
      select: { id: true, nama: true },
    });
    if (!roleBaru) {
      return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
    }
    if (roleBaru.id === target.roleId) {
      return NextResponse.json(
        { error: `Kader sudah berperan ${roleBaru.nama}.` },
        { status: 400 },
      );
    }

    const hasil = await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { roleId: roleBaru.id } }),
      prisma.auditLog.create({
        data: {
          aktorId: user.id,
          aksi: "user.ubah_role",
          entitasTipe: "User",
          entitasId: target.id,
          dataSebelum: { role: target.role.nama },
          dataSesudah: { role: roleBaru.nama },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      email: target.email,
      roleNama: hasil[0] ? roleBaru.nama : roleBaru.nama,
    });
  }

  // ---- Cabang ubah status (pengguna.suspend, logika lama) ----
  if (!user.permissions.includes("pengguna.suspend")) {
    return NextResponse.json(
      { error: "Hanya pengelola kader yang dapat mengubah status akun." },
      { status: 403 },
    );
  }

  const statusAkun = body.statusAkun;
  if (statusAkun !== "AKTIF" && statusAkun !== "SUSPEND" && statusAkun !== "PENDING") {
    return NextResponse.json({ error: "Status akun tidak valid." }, { status: 400 });
  }

  // Verifikasi pendaftaran: dari PENDING hanya boleh ke AKTIF (setujui)
  // atau SUSPEND (tolak).
  if (
    target.statusAkun === "PENDING" &&
    statusAkun !== "AKTIF" &&
    statusAkun !== "SUSPEND"
  ) {
    return NextResponse.json(
      { error: "Pendaftaran menunggu hanya bisa disetujui atau ditolak." },
      { status: 400 },
    );
  }

  const aksi =
    target.statusAkun === "PENDING" && statusAkun === "AKTIF"
      ? "user.setujui_kader"
      : target.statusAkun === "PENDING" && statusAkun === "SUSPEND"
        ? "user.tolak_kader"
        : statusAkun === "SUSPEND"
          ? "user.suspend"
          : "user.aktivasi";

  const diperbarui = await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { statusAkun: statusAkun as StatusAkun } }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi,
        entitasTipe: "User",
        entitasId: target.id,
        dataSebelum: { statusAkun: target.statusAkun },
        dataSesudah: { statusAkun },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, email: target.email, statusAkun: diperbarui[0].statusAkun });
}

/**
 * Hapus akun permanen (pengguna.suspend). Guard integritas: akun yang masih
 * memiliki artikel TIDAK boleh dihapus (FK Artikel.penulisId Restrict —
 * rekam jejak redaksi dilindungi); gunakan Suspend untuk non-aktifasi.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requirePermission("pengguna.suspend");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Kader tidak ditemukan." }, { status: 404 });
  }
  if (target.id === user.id) {
    return NextResponse.json(
      { error: "Tidak dapat menghapus akun sendiri." },
      { status: 400 },
    );
  }

  const jumlahArtikel = await prisma.artikel.count({ where: { penulisId: id } });
  if (jumlahArtikel > 0) {
    return NextResponse.json(
      {
        error: `Akun tidak dapat dihapus karena masih memiliki ${jumlahArtikel} artikel (rekam jejak redaksi). Gunakan fitur Tangguhkan untuk menonaktifkan akun ini.`,
      },
      { status: 409 },
    );
  }

  await prisma.$transaction([
    prisma.user.delete({ where: { id } }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: "user.hapus_permanen",
        entitasTipe: "User",
        entitasId: target.id,
        dataSebelum: { email: target.email, username: target.username, statusAkun: target.statusAkun },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, email: target.email });
}