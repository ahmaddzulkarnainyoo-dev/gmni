/**
 * Mesin gamifikasi kader (Sub-Fase 3.2 Â· blueprint 8.4 & 7.7).
 * Poin: ARTIKEL_TERBIT=10, KOMENTAR_TAMPIL=2, AKTIF_HARIAN=1.
 * Jendela mingguan: Senin 00:00 WIB â€” reset via filter tanggal (tanpa cron).
 * Filter anonimitas mutlak: hanya artikel ASLI + tidak dikecualikan.
 */
import { prisma } from "@/lib/prisma";
import type { JenisAktivitas } from "@prisma/client";

export const POIN_AKTIVITAS: Record<JenisAktivitas, number> = {
  ARTIKEL_TERBIT: 10,
  KOMENTAR_TAMPIL: 2,
  AKTIF_HARIAN: 1,
};

/** Awal minggu berjalan (Senin 00:00 WIB) sebagai Date UTC. */
export function awalMingguBerjalan(sekarang = new Date()): Date {
  const wib = new Date(sekarang.getTime() + 7 * 3_600_000);
  const hari = wib.getUTCDay();
  const mundur = (hari + 6) % 7;
  const seninWib = new Date(
    Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate() - mundur),
  );
  return new Date(seninWib.getTime() - 7 * 3_600_000);
}

/** Akhir minggu berjalan (Senin berikutnya 00:00 WIB, eksklusif). */
export function akhirMingguBerjalan(sekarang = new Date()): Date {
  return new Date(awalMingguBerjalan(sekarang).getTime() + 7 * 86_400_000);
}

/** Label periode mingguan, mis. "2026-W37". */
export function labelPeriodeMingguan(sekarang = new Date()): string {
  const awal = awalMingguBerjalan(sekarang);
  const awalTahun = Date.UTC(awal.getUTCFullYear(), 0, 1);
  const minggu = Math.floor((awal.getTime() - awalTahun) / (7 * 86_400_000)) + 1;
  return `${awal.getUTCFullYear()}-W${String(minggu).padStart(2, "0")}`;
}

/** Tanggal hari UTC (tengah malam) untuk dedup AKTIF_HARIAN. */
export function tanggalHariUtc(sekarang = new Date()): Date {
  return new Date(
    Date.UTC(sekarang.getUTCFullYear(), sekarang.getUTCMonth(), sekarang.getUTCDate()),
  );
}

/** Catat satu aktivitas berpoin (idempoten per hari via unique). */
export async function catatAktivitas(
  userId: string,
  jenis: JenisAktivitas,
  opsi?: { detail?: string; tanggal?: Date },
): Promise<void> {
  const tanggal = opsi?.tanggal ?? new Date();
  try {
    await prisma.kegiatanKader.upsert({
      where: {
        userId_jenis_tanggalHari: {
          userId,
          jenis,
          tanggalHari: tanggalHariUtc(tanggal),
        },
      },
      update: {},
      create: {
        userId,
        jenis,
        poin: POIN_AKTIVITAS[jenis],
        detail: opsi?.detail,
        tanggalHari: tanggalHariUtc(tanggal),
        tanggal,
      },
    });
  } catch {
    // Poin tidak boleh menggagalkan aksi utama.
  }
}

/** Hapus poin yang merujuk ke sebuah entitas (retraksi moderasi). */
export async function tarikPoinEntitas(detail: string): Promise<void> {
  try {
    await prisma.kegiatanKader.deleteMany({ where: { detail } });
  } catch {
    // Best-effort.
  }
}
/** Beri badge idempoten (upsert — duplikat diabaikan). */
export async function beriBadge(
  userId: string,
  jenisBadge: string,
  periode: string,
): Promise<void> {
  await prisma.pencapaian.upsert({
    where: { userId_jenisBadge_periode: { userId, jenisBadge, periode } },
    update: {},
    create: { userId, jenisBadge, periode },
  });
}

/** Label badge yang ramah tampil (Indonesia). */
export const LABEL_BADGE: Record<string, string> = {
  ARTIKEL_FIRST: "Tulisan Perdana",
  ARTIKEL_10: "Sepuluh Tulisan",
  KOMENTAR_10: "Sepuluh Komentar",
  KOMENTAR_50: "Lima Puluh Komentar",
  STREAK_3: "Konsisten 3 Hari",
  STREAK_7: "Aktif 7 Hari",
  STREAK_30: "Loyal 30 Hari",
  TOP_3_MINGGU: "Tiga Besar Mingguan",
};
/** Perbarui streak harian kader + badge milestone (3/7/30 hari). */
export async function perbaruiStreak(userId: string, sekarang = new Date()): Promise<number> {
  const hariIni = tanggalHariUtc(sekarang);
  const kemarin = new Date(hariIni.getTime() - 86400000);
  try {
    const lama = await prisma.streakKader.findUnique({ where: { userId } });
    if (!lama) {
      await prisma.streakKader.create({
        data: { userId, jumlahHariBeruntun: 1, hariTerakhirAktif: hariIni },
      });
      return 1;
    }
    const t = new Date(lama.hariTerakhirAktif);
    const terakhirHari = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
    if (terakhirHari === hariIni.getTime()) return lama.jumlahHariBeruntun;
    const beruntun = terakhirHari === kemarin.getTime() ? lama.jumlahHariBeruntun + 1 : 1;
    await prisma.streakKader.update({
      where: { userId },
      data: { jumlahHariBeruntun: beruntun, hariTerakhirAktif: hariIni },
    });
    if (beruntun === 3) await beriBadge(userId, "STREAK_3", "SEMUA").catch(() => undefined);
    if (beruntun === 7) await beriBadge(userId, "STREAK_7", "SEMUA").catch(() => undefined);
    if (beruntun === 30) await beriBadge(userId, "STREAK_30", "SEMUA").catch(() => undefined);
    return beruntun;
  } catch {
    return 0;
  }
}

/** Evaluasi badge lifetime (artikel & komentar) — dipanggil lazily. */
export async function evaluasiBadgeKader(userId: string): Promise<void> {
  try {
    const [jumlahArtikel, jumlahKomentar] = await Promise.all([
      prisma.artikel.count({
        where: {
          penulisId: userId,
          status: "TERBIT",
          visibilitasPenulis: "ASLI",
          dikecualikanDariLeaderboard: false,
        },
      }),
      prisma.komentar.count({ where: { penulisId: userId, status: "TAMPIL" } }),
    ]);
    if (jumlahArtikel >= 1) await beriBadge(userId, "ARTIKEL_FIRST", "SEMUA");
    if (jumlahArtikel >= 10) await beriBadge(userId, "ARTIKEL_10", "SEMUA");
    if (jumlahKomentar >= 10) await beriBadge(userId, "KOMENTAR_10", "SEMUA");
    if (jumlahKomentar >= 50) await beriBadge(userId, "KOMENTAR_50", "SEMUA");
  } catch {
    // Best-effort.
  }
}
export type BarisPeringkat = {
  userId: string;
  namaLengkap: string;
  username: string;
  fotoProfil: string | null;
  daerahAsal: string | null;
  totalPoin: number;
  jumlahArtikel: number;
  jumlahKomentar: number;
};

/** Agregasi leaderboard minggu berjalan dari ledger KegiatanKader. */
export async function ambilPeringkatMingguan(batas = 50): Promise<BarisPeringkat[]> {
  const awal = awalMingguBerjalan();
  const akhir = akhirMingguBerjalan();
  const ledger = await prisma.kegiatanKader.groupBy({
    by: ["userId"],
    where: { tanggal: { gte: awal, lt: akhir } },
    _sum: { poin: true },
    orderBy: { _sum: { poin: "desc" } },
    take: batas * 2,
  });
  if (ledger.length === 0) return [];
  const userIds = ledger.map((l) => l.userId);
  const [pengguna, artikel, komentar] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds }, statusAkun: "AKTIF", profilTersembunyi: false },
      select: { id: true, namaLengkap: true, username: true, fotoProfil: true, daerahAsal: true },
    }),
    prisma.artikel.groupBy({
      by: ["penulisId"],
      where: {
        penulisId: { in: userIds },
        status: "TERBIT",
        visibilitasPenulis: "ASLI",
        dikecualikanDariLeaderboard: false,
        tanggalTerbit: { gte: awal, lt: akhir },
      },
      _count: { _all: true },
    }),
    prisma.komentar.groupBy({
      by: ["penulisId"],
      where: { penulisId: { in: userIds }, status: "TAMPIL", tanggal: { gte: awal, lt: akhir } },
      _count: { _all: true },
    }),
  ]);
  const petaPengguna = new Map(pengguna.map((u) => [u.id, u]));
  const petaArtikel = new Map(artikel.map((a) => [a.penulisId, a._count._all]));
  const petaKomentar = new Map(
    komentar.filter((k) => k.penulisId).map((k) => [k.penulisId as string, k._count._all]),
  );
  const baris: BarisPeringkat[] = [];
  for (const l of ledger) {
    const u = petaPengguna.get(l.userId);
    if (!u) continue;
    baris.push({
      userId: u.id,
      namaLengkap: u.namaLengkap,
      username: u.username,
      fotoProfil: u.fotoProfil,
      daerahAsal: u.daerahAsal,
      totalPoin: l._sum.poin ?? 0,
      jumlahArtikel: petaArtikel.get(u.id) ?? 0,
      jumlahKomentar: petaKomentar.get(u.id) ?? 0,
    });
    if (baris.length >= batas) break;
  }
  return baris;
}

/** Ringkasan poin & peringkat seorang kader untuk widget dasbor. */
export async function ambilRingkasanKader(userId: string): Promise<{
  poinMingguIni: number;
  peringkat: number | null;
  streak: number;
  jumlahBadge: number;
}> {
  const awal = awalMingguBerjalan();
  const akhir = akhirMingguBerjalan();
  const [agregat, streak, jumlahBadge] = await Promise.all([
    prisma.kegiatanKader.aggregate({
      where: { userId, tanggal: { gte: awal, lt: akhir } },
      _sum: { poin: true },
    }),
    prisma.streakKader.findUnique({ where: { userId } }),
    prisma.pencapaian.count({ where: { userId } }),
  ]);
  const poinMingguIni = agregat._sum.poin ?? 0;
  let peringkat: number | null = null;
  if (poinMingguIni > 0) {
    const diAtas = await prisma.kegiatanKader.groupBy({
      by: ["userId"],
      where: { tanggal: { gte: awal, lt: akhir } },
      _sum: { poin: true },
      having: { poin: { _sum: { gt: poinMingguIni } } },
    });
    peringkat = diAtas.length + 1;
  }
  return { poinMingguIni, peringkat, streak: streak?.jumlahHariBeruntun ?? 0, jumlahBadge };
}

/** Snapshot top-N minggu berjalan + badge TOP_3_MINGGU (lazily). */
export async function snapshotPeringkatMingguan(batas = 10): Promise<void> {
  try {
    const awal = awalMingguBerjalan();
    const akhir = akhirMingguBerjalan();
    const periode = labelPeriodeMingguan();
    const baris = await ambilPeringkatMingguan(batas);
    let posisi = 0;
    for (const b of baris) {
      posisi += 1;
      await prisma.peringkatMingguan.upsert({
        where: {
          mingguMulai_kategori_userId: { mingguMulai: awal, kategori: "POIN_UMUM", userId: b.userId },
        },
        update: { skor: b.totalPoin, peringkat: posisi, mingguSelesai: akhir },
        create: {
          mingguMulai: awal,
          mingguSelesai: akhir,
          kategori: "POIN_UMUM",
          userId: b.userId,
          skor: b.totalPoin,
          peringkat: posisi,
        },
      });
      if (posisi <= 3) await beriBadge(b.userId, "TOP_3_MINGGU", periode).catch(() => undefined);
    }
  } catch {
    // Best-effort.
  }
}
