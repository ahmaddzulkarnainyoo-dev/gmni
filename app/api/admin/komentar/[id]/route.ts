import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import type { Prisma } from "@prisma/client";
import { catatAktivitas, evaluasiBadgeKader, tarikPoinEntitas } from "@/lib/gamifikasi";

/**
 * PATCH /api/admin/komentar/[id] — aksi moderasi:
 * SEMBUNYIKAN | TAMPILKAN | BENARKAN_LAPORAN (blueprint 8.3).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePermission("komentar.moderasi");
  const { id } = await params;

  const komentar = await prisma.komentar.findUnique({ where: { id } });
  if (!komentar) {
    return NextResponse.json({ error: "Komentar tidak ditemukan." }, { status: 404 });
  }

  const body = (await request.json()) as { aksi?: string };
  const aksi = body.aksi;

  let data: Prisma.KomentarUpdateInput;
  let aksiLog: string;
  if (aksi === "SEMBUNYIKAN") {
    data = { status: "DISEMBUNYIKAN" };
    aksiLog = "komentar.sembunyikan";
  } else if (aksi === "TAMPILKAN") {
    data = { status: "TAMPIL" };
    aksiLog = "komentar.tampilkan";
  } else if (aksi === "BENARKAN_LAPORAN") {
    data = { jumlahLaporan: 0 };
    aksiLog = "komentar.laporan_dibenarkan";
  } else {
    return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.komentar.update({ where: { id }, data }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: aksiLog,
        entitasTipe: "Komentar",
        entitasId: id,
        dataSebelum: {
          status: komentar.status,
          jumlahLaporan: komentar.jumlahLaporan,
        },
        dataSesudah: data as Prisma.InputJsonValue,
      },
    }),
  ]);

  // Retraksi/pemberian ulang poin (disetujui penuh): SEMBUNYIKAN tarik
  // poin; TAMPILKAN beri lagi bila penulisnya kader (best-effort).
  if (aksi === "SEMBUNYIKAN") {
    tarikPoinEntitas(id).catch(() => undefined);
  } else if (aksi === "TAMPILKAN" && komentar.penulisId) {
    const penulisId = komentar.penulisId;
    catatAktivitas(penulisId, "KOMENTAR_TAMPIL", { detail: id })
      .then(() => evaluasiBadgeKader(penulisId))
      .catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/komentar/[id] — hapus permanen + turunkan counter artikel. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePermission("komentar.moderasi");
  const { id } = await params;

  const komentar = await prisma.komentar.findUnique({ where: { id } });
  if (!komentar) {
    return NextResponse.json({ error: "Komentar tidak ditemukan." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.komentar.delete({ where: { id } }),
    prisma.artikel.updateMany({
      where: { id: komentar.artikelId, jumlahKomentar: { gt: 0 } },
      data: { jumlahKomentar: { decrement: 1 } },
    }),
    prisma.auditLog.create({
      data: {
        aktorId: user.id,
        aksi: "komentar.hapus",
        entitasTipe: "Komentar",
        entitasId: id,
        dataSebelum: { isi: komentar.isi, status: komentar.status },
      },
    }),
  ]);

  // Retraksi poin hard-delete (disetujui penuh) — best-effort.
  tarikPoinEntitas(id).catch(() => undefined);

  return NextResponse.json({ ok: true });
}