import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FormPulihkanSandi } from "@/components/auth/FormPulihkanSandi";

export const metadata: Metadata = {
  title: "Pulihkan Kata Sandi",
  description: "Setel sandi baru lewat tautan pemulihan sekali pakai.",
};

export const dynamic = "force-dynamic";

/**
 * Halaman konsumsi tautan pemulihan (/pulihkan-sandi?token=...).
 * Token divalidasi sisi server dulu (ada, belum dipakai, belum kedaluwarsa,
 * akun AKTIF) — bila tidak sah, tampilkan pesan tanpa membocorkan detail.
 */
export default async function HalamanPulihkan({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = typeof token === "string" ? token.trim() : "";

  let sah = false;
  if (t) {
    try {
      const rekaman = await prisma.tokenPemulihan.findUnique({
        where: { token: t },
        select: {
          dipakaiAt: true,
          kedaluwarsaAt: true,
          user: { select: { statusAkun: true } },
        },
      });
      sah =
        !!rekaman &&
        rekaman.dipakaiAt === null &&
        rekaman.kedaluwarsaAt > new Date() &&
        rekaman.user.statusAkun === "AKTIF";
    } catch (error) {
      console.error("[pulihkan-sandi] Gagal memeriksa token:", error);
    }
  }

  if (!sah) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900">
          Tautan Tidak Berlaku
        </h1>
        <p
          role="alert"
          className="border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          Tautan pemulihan tidak valid, sudah dipakai, atau kedaluwarsa.
        </p>
        <p className="text-sm text-hitam-500">
          <Link
            href="/lupa-password"
            className="font-semibold text-gmnimerah-600 underline decoration-2 underline-offset-4"
          >
            Minta tautan baru
          </Link>{" "}
          atau{" "}
          <Link
            href="/login"
            className="font-semibold text-gmnimerah-600 underline decoration-2 underline-offset-4"
          >
            kembali ke halaman masuk
          </Link>
          .
        </p>
      </div>
    );
  }

  return <FormPulihkanSandi token={t} />;
}