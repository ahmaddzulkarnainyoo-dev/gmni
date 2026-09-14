import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const ROLES_ADMIN = ["Super Admin", "Editor"];
type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/donasi/[id] — { aksi: "VERIFIKASI" | "TOLAK" }. */
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Harus masuk terlebih dahulu." }, { status: 401 });
  }
  if (!user.roleNama || !ROLES_ADMIN.includes(user.roleNama)) {
    return NextResponse.json(
      { error: "Hanya Super Admin atau Editor yang dapat memverifikasi donasi." },
      { status: 403 },
    );
  }

  const ada = await prisma.donasi.findUnique({ where: { id } });
  if (!ada) return NextResponse.json({ error: "Donasi tidak ditemukan." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const aksi = typeof body?.aksi === "string" ? body.aksi.toUpperCase() : "";
  if (aksi !== "VERIFIKASI" && aksi !== "TOLAK") {
    return NextResponse.json({ error: "Aksi harus VERIFIKASI atau TOLAK." }, { status: 400 });
  }
  const status = aksi === "VERIFIKASI" ? "TERVERIFIKASI" : "DITOLAK";

  try {
    await prisma.$transaction(async (tx) => {
      await tx.donasi.update({
        where: { id },
        data: { status, verifikasiOlehId: user.id, verifikasiAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          aktorId: user.id,
          aksi: aksi === "VERIFIKASI" ? "donasi.verifikasi" : "donasi.tolak",
          entitasTipe: "Donasi",
          entitasId: id,
          dataSebelum: { status: ada.status },
          dataSesudah: { status },
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/donasi] Gagal memverifikasi donasi:", error);
    return NextResponse.json({ error: "Gagal memverifikasi donasi." }, { status: 500 });
  }
}
