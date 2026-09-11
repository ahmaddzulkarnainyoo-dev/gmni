import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DaftarForm } from "@/components/auth/DaftarForm";

export const metadata: Metadata = {
  title: "Registrasi Kader",
  description: "Pendaftaran kader info Marhaen melalui token undangan.",
};

export default async function HalamanDaftar({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let pengundang: string | null = null;
  if (token) {
    const pemilik = await prisma.user.findUnique({
      where: { tokenUndangan: token },
      select: { namaLengkap: true, statusAkun: true },
    });
    if (pemilik && pemilik.statusAkun === "AKTIF") {
      pengundang = pemilik.namaLengkap;
    }
  }

  if (!token || !pengundang) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900">
          Token Tidak Sah
        </h1>
        <p className="text-sm leading-relaxed text-hitam-600">
          Tautan undangan tidak valid atau sudah digunakan. Registrasi kader
          hanya dapat dilakukan melalui undangan resmi dari kader aktif GMNI.
        </p>
        <Link
          href="/"
          className="inline-block border-2 border-hitam-900 px-5 py-2.5 font-sans text-sm font-bold uppercase tracking-wide text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return <DaftarForm token={token} pengundang={pengundang} />;
}