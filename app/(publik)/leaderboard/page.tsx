import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KickerLabel } from "@/components/ui/KickerLabel";
import {
  akhirMingguBerjalan,
  ambilPeringkatMingguan,
  awalMingguBerjalan,
  labelPeriodeMingguan,
  snapshotPeringkatMingguan,
} from "@/lib/gamifikasi";
import { fmtTanggal } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: `Leaderboard ${labelPeriodeMingguan()} - info Marhaen`,
    description:
      "Papan peringkat mingguan kader GMNI: penulis terajin & paling aktif diskusi. Reset tiap Senin 00:00 WIB.",
  };
}

/**
 * Halaman publik /leaderboard (blueprint 8.4): read-only untuk semua,
 * termasuk non-kader. Kader tersembunyi/SUSPEND tidak tampil (privasi).
 */
export default async function HalamanLeaderboard() {
  const [baris, totalMingguLalu] = await Promise.all([
    ambilPeringkatMingguan(50),
    prisma.kegiatanKader.count({
      where: { tanggal: { gte: awalMingguBerjalan(), lt: akhirMingguBerjalan() } },
    }),
  ]);
  // Snapshot lazily top-10 + badge tiga besar (best-effort, tanpa cron).
  await snapshotPeringkatMingguan(10);

  const tigaBesar = baris.slice(0, 3);
  const sisanya = baris.slice(3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <KickerLabel>Papan Peringkat</KickerLabel>
      <h1 className="mt-2 font-serif text-3xl font-extrabold text-hitam-900 md:text-5xl">
        Leaderboard <span className="italic text-gmnimerah-600">Mingguan</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-hitam-500">
        Periode {labelPeriodeMingguan()} (mulai {fmtTanggal(awalMingguBerjalan())} - reset tiap
        Senin 00:00 WIB). {totalMingguLalu} aktivitas tercatat minggu ini. Tulisan samaran &amp;
        redaksi tidak dihitung - demi janji anonimitas. Akun tim redaksi/admin tidak diikutkan di
        papan ini.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-widest text-hitam-500">
        <span className="border border-hitam-300 bg-white px-2 py-1">Artikel terbit - 10 pts</span>
        <span className="border border-hitam-300 bg-white px-2 py-1">Komentar - 2 pts</span>
        <span className="border border-hitam-300 bg-white px-2 py-1">Aktif harian - 1 pt</span>
      </div>

      {baris.length === 0 ? (
        <div className="mt-8 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
          <p className="font-serif text-xl font-bold text-hitam-900">Belum ada peringkat.</p>
          <p className="mt-2 text-sm text-hitam-500">
            Papan akan terisi begitu kader menulis, berkomentar, dan aktif minggu ini.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tigaBesar.map((b, i) => (
              <Link
                key={b.userId}
                href={`/profil/${b.username}`}
                className={`border-2 p-5 transition-colors ${
                  i === 0
                    ? "border-gmnimerah-500 bg-hitam-900 text-white"
                    : "border-hitam-900 bg-white hover:border-gmnimerah-500"
                }`}
              >
                <p
                  className={`font-mono text-[11px] font-bold uppercase tracking-widest ${
                    i === 0 ? "text-gmnimerah-400" : "text-gmnimerah-600"
                  }`}
                >
                  Peringkat {i + 1}
                </p>
                <p className="mt-2 font-serif text-xl font-extrabold">{b.namaLengkap}</p>
                <p
                  className={`mt-0.5 font-mono text-[11px] uppercase tracking-widest ${
                    i === 0 ? "text-kertas-300" : "text-hitam-400"
                  }`}
                >
                  @{b.username}
                  {b.daerahAsal ? ` - ${b.daerahAsal}` : ""}
                </p>
                <p className="mt-3 font-mono text-2xl font-extrabold">{b.totalPoin} pts</p>
                <p
                  className={`mt-1 font-mono text-[11px] uppercase tracking-widest ${
                    i === 0 ? "text-kertas-300" : "text-hitam-500"
                  }`}
                >
                  {b.jumlahArtikel} artikel - {b.jumlahKomentar} komentar
                </p>
              </Link>
            ))}
          </div>

          {sisanya.length > 0 && (
            <section className="mt-6 border-2 border-hitam-900 bg-white">
              <ol>
                {sisanya.map((b, i) => (
                  <li
                    key={b.userId}
                    className="flex items-center gap-3 border-b border-hitam-100 px-4 py-2.5 last:border-b-0"
                  >
                    <span className="w-8 font-mono text-sm font-bold text-hitam-400">
                      {String(i + 4).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/profil/${b.username}`}
                      className="min-w-0 flex-1 truncate font-sans text-sm font-bold text-hitam-900 hover:text-gmnimerah-600"
                    >
                      {b.namaLengkap}
                      <span className="ml-2 font-mono text-[11px] font-normal text-hitam-400">
                        @{b.username}
                      </span>
                    </Link>
                    <span className="hidden font-mono text-[11px] uppercase tracking-widest text-hitam-400 sm:inline">
                      {b.jumlahArtikel}a - {b.jumlahKomentar}k
                    </span>
                    <span className="font-mono text-sm font-bold text-gmnimerah-600">
                      {b.totalPoin} pts
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </div>
  );
}