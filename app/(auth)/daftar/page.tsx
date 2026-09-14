import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DaftarForm } from "@/components/auth/DaftarForm";
import { FormPendaftaranPublik } from "@/components/auth/FormPendaftaranPublik";

export const metadata: Metadata = {
  title: "Registrasi Kader",
  description: "Pendaftaran terbuka kader info Marhaen — diverifikasi Admin Redaksi.",
};

export const dynamic = "force-dynamic";

export default async function HalamanDaftar({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // Mode invite: token sah dari generator global ATAU invite legacy kader AKTIF.
  let pengundang: string | null = null;
  if (token) {
    const undanganGlobal = await prisma.tokenUndangan.findUnique({
      where: { token },
      include: { dibuatOleh: { select: { namaLengkap: true, statusAkun: true } } },
    });
    if (
      undanganGlobal &&
      !undanganGlobal.dipakaiAt &&
      undanganGlobal.dibuatOleh?.statusAkun === "AKTIF"
    ) {
      pengundang = undanganGlobal.dibuatOleh.namaLengkap;
    } else {
      const pemilik = await prisma.user.findUnique({
        where: { tokenUndangan: token },
        select: { namaLengkap: true, statusAkun: true },
      });
      if (pemilik && pemilik.statusAkun === "AKTIF") {
        pengundang = pemilik.namaLengkap;
      }
    }
  }

  if (token && pengundang) {
    return <DaftarForm token={token} pengundang={pengundang} />;
  }

  // Mode pendaftaran terbuka (tanpa token) — default baru.
  return <FormPendaftaranPublik tokenTidakSah={Boolean(token)} />;
}
