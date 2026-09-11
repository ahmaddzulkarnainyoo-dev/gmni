import type { StatusArtikel, VisibilitasPenulis } from "@prisma/client";

/** Label + gaya visual status alur editorial (blueprint 6.1). */
export const LABEL_STATUS: Record<StatusArtikel, string> = {
  DRAFT: "Draf",
  DIAJUKAN: "Diajukan ke Redaksi",
  SEDANG_DITINJAU: "Sedang Ditinjau",
  DIMINTA_REVISI: "Diminta Revisi",
  DISETUJUI: "Disetujui",
  TERBIT: "Terbit",
  DITOLAK: "Ditolak",
  DIARSIPKAN: "Diarsipkan",
};

export const GAYA_STATUS: Record<StatusArtikel, string> = {
  DRAFT: "bg-hitam-100 text-hitam-700",
  DIAJUKAN: "bg-gmnimerah-100 text-gmnimerah-700",
  SEDANG_DITINJAU: "bg-hitam-50 text-hitam-600",
  DIMINTA_REVISI: "bg-kertas-200 text-hitam-700",
  DISETUJUI: "bg-hitam-100 text-hitam-700",
  TERBIT: "bg-gmnimerah-500 text-white",
  DITOLAK: "bg-gmnimerah-700 text-white",
  DIARSIPKAN: "bg-hitam-200 text-hitam-600",
};

export const LABEL_VISIBILITAS: Record<VisibilitasPenulis, string> = {
  ASLI: "Nama Asli",
  SAMARAN: "Nama Samaran",
  REDAKSI: "Atas Nama Redaksi",
};

export function badgeStatus(status: StatusArtikel): string {
  const label = LABEL_STATUS[status];
  const gaya = GAYA_STATUS[status];
  return `<span class="inline-block border border-hitam-900 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${gaya}">${label}</span>`;
}