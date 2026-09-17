import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { amanAsync } from "@/lib/kueri-aman";
import {
  ambilPeringkatMingguan,
  awalMingguBerjalan,
  labelPeriodeMingguan,
  PERAN_ADMIN,
} from "@/lib/gamifikasi";

export const metadata: Metadata = { title: "Kelola Leaderboard" };
export const dynamic = "force-dynamic";

/**
 * Kelola Leaderboard (admin): papan peringkat POIN_UMUM minggu berjalan
 * termasuk kader berperfil tersembunyi (khusus kebutuhan redaksi internal).
 * Pemenang manual "Penulis Terbaik" aktif di sub-fase lanjutan.
 */
export default async function HalamanLeaderboardAdmin() {
  await requireRole("Super Admin", "Editor");

  const [baris, gagalMemuat] = await amanAsync(
    () =>
      Promise.all([
        // Panel audit: sertakan kader tersembunyi + akun tim redaksi/admin.
        ambilPeringkatMingguan(25, { sertakanTersembunyi: true, sertakanAdmin: true }),
        Promise.resolve(false),
      ]),
    [[], true],
  );

  const periode = labelPeriodeMingguan();
  const awal = awalMingguBerjalan().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Kelola Leaderboard
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Papan peringkat kontribusi kader minggu berjalan (periode {periode},
          mulai {awal}). Poin: artikel 10 - komentar 2 - aktivitas harian 1. Panel audit
          ini menyertakan kader tersembunyi &amp; akun tim redaksi/admin.
        </p>
      </div>

      {gagalMemuat && (
        <p
          role="alert"
          className="mt-4 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-4 py-2.5 text-sm font-semibold text-gmnimerah-700"
        >
          Data tidak dapat dimuat sementara - periksa koneksi database lalu
          muat ulang halaman.
        </p>
      )}

      {baris.length === 0 ? (
        <div className="mt-6 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
          <p className="font-serif text-xl font-bold text-hitam-900">
            Belum ada peringkat minggu ini.
          </p>
          <p className="mt-1 text-sm text-hitam-500">
            Peringkat muncul otomatis begitu kader beraktivitas (menulis,
            berkomentar, atau masuk dasbor).
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border-2 border-hitam-900">
          <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b-2 border-hitam-900 bg-kertas-100">
                <th className="px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
                  #
                </th>
                <th className="px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
                  Kader
                </th>
                <th className="px-3 py-2.5 text-right font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
                  Artikel
                </th>
                <th className="px-3 py-2.5 text-right font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
                  Komentar
                </th>
                <th className="px-3 py-2.5 text-right font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
                  Poin
                </th>
              </tr>
            </thead>
            <tbody>
              {baris.map((b, i) => (
                <tr
                  key={b.userId}
                  className={i > 0 ? "border-t border-hitam-100" : undefined}
                >
                  <td className="px-3 py-2.5 font-mono text-[13px] font-bold text-hitam-900">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-sans text-sm font-bold text-hitam-900">
                      {b.namaLengkap}
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-hitam-500">
                      @{b.username}
                    </span>
                    {b.profilTersembunyi === true && (
                      <span className="ml-2 inline-block border border-hitam-900 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-hitam-600">
                        Tersembunyi
                      </span>
                    )}
                    {b.roleNama && PERAN_ADMIN.includes(b.roleNama) && (
                      <span className="ml-2 inline-block border border-gmnimerah-500 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gmnimerah-600">
                        Tim Redaksi
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] text-hitam-700">
                    {b.jumlahArtikel}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] text-hitam-700">
                    {b.jumlahKomentar}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] font-bold text-gmnimerah-700">
                    {b.totalPoin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-hitam-500">
        Catatan: fitur pemilihan pemenang manual &ldquo;Penulis Terbaik&rdquo;
        diaktifkan pada sub-fase lanjutan. Lihat papan publik di{" "}
        <Link href="/leaderboard" className="font-bold text-gmnimerah-600 hover:underline">
          /leaderboard
        </Link>
        .
      </p>
    </div>
  );
}