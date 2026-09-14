import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { iklanSedangTayang } from "@/lib/monetisasi";

/**
 * SlotIklanHeader — bar banner tipis non-intrusif di bawah navigasi utama.
 * Server component: baca DB langsung, fallback null (tidak render) bila
 * tidak ada iklan tayang atau DB offline. Maksimal 1 banner.
 */
export async function SlotIklanHeader() {
  let iklan: { id: string; nama: string; gambarUrl: string } | null = null;
  try {
    const daftar = await prisma.iklan.findMany({
      where: { status: "AKTIF", lokasiSlot: "HEADER" },
      orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        nama: true,
        gambarUrl: true,
        status: true,
        tanggalMulai: true,
        tanggalSelesai: true,
      },
    });
    iklan = daftar.find((i) => iklanSedangTayang(i)) ?? null;
  } catch {
    return null;
  }
  if (!iklan) return null;

  return (
    <div className="border-b border-hitam-100 bg-kertas-100">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5">
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-hitam-400">
          Iklan
        </span>
        <Link
          href={`/api/iklan/${iklan.id}/klik`}
          className="block min-w-0 flex-1"
          aria-label={`Iklan: ${iklan.nama}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iklan.gambarUrl}
            alt={iklan.nama}
            loading="lazy"
            className="mx-auto max-h-16 w-auto max-w-full object-contain"
          />
        </Link>
      </div>
    </div>
  );
}
