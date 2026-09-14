import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { iklanSedangTayang } from "@/lib/monetisasi";
import { KickerLabel } from "@/components/ui/KickerLabel";

/**
 * SlotIklanSidebar — kartu banner samping non-intrusif (artikel/berita).
 * Server component: fallback null bila tak ada iklan tayang. Maks 1 banner.
 */
export async function SlotIklanSidebar() {
  let iklan: { id: string; nama: string; gambarUrl: string } | null = null;
  try {
    const daftar = await prisma.iklan.findMany({
      where: { status: "AKTIF", lokasiSlot: "SIDEBAR" },
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
    <aside aria-label="Iklan" className="border-2 border-hitam-900 bg-white p-3">
      <KickerLabel>Iklan</KickerLabel>
      <Link href={`/api/iklan/${iklan.id}/klik`} className="mt-2 block" aria-label={`Iklan: ${iklan.nama}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iklan.gambarUrl}
          alt={iklan.nama}
          loading="lazy"
          className="aspect-[4/3] w-full border border-hitam-100 object-cover"
        />
      </Link>
      <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-widest text-hitam-400">
        {iklan.nama}
      </p>
    </aside>
  );
}
