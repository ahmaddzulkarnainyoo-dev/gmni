import Link from "next/link";
import { KickerLabel } from "@/components/ui/KickerLabel";
import { WidgetAktivitas } from "@/components/dasbor/WidgetAktivitas";
import { requireAuthUser } from "@/lib/session";
import {
  ambilPeringkatMingguan,
  ambilRingkasanKader,
  awalMingguBerjalan,
  evaluasiBadgeKader,
  labelPeriodeMingguan,
} from "@/lib/gamifikasi";
import { fmtTanggal } from "@/lib/articles";
import { amanAsync } from "@/lib/kueri-aman";


/** Label Indonesia untuk jenis aktivitas ledger (transparansi poin). */
function labelJenis(jenis: string): string {
  if (jenis === "ARTIKEL_TERBIT") return "Artikel terbit";
  if (jenis === "KOMENTAR_TAMPIL") return "Komentar";
  return "Harian";
}

export const dynamic = "force-dynamic";

/**
 * Dasbor kader - ringkasan gamifikasi mingguan (blueprint 8.4):
 * poin minggu ini, peringkat, streak, badge + mini board top-5.
 */
export default async function DasborPage() {
  const user = await requireAuthUser();
  await evaluasiBadgeKader(user.id);

  // Anti-crash (bukan error boundary "Mesin Cetak Macet"): kegagalan DB -
  // mis. timeout pooler Supabase - dikembalikan sebagai fallback + banner,
  // pola sama dengan halaman tulisan-saya (null = gagal, [] = memang kosong).
  type RingkasanKader = Awaited<ReturnType<typeof ambilRingkasanKader>>;
  type BarisPeringkat = Awaited<ReturnType<typeof ambilPeringkatMingguan>>;
  const RINGKASAN_KOSONG: RingkasanKader = {
    poinMingguIni: 0,
    peringkat: null,
    streak: 0,
    jumlahBadge: 0,
    rincian: [],
  };
  const [ringkasanHasil, limaBesarHasil] = await Promise.all([
    amanAsync(() => ambilRingkasanKader(user.id), null),
    amanAsync(() => ambilPeringkatMingguan(5), null),
  ]);
  const ringkasanGagal = ringkasanHasil === null;
  const papanGagal = limaBesarHasil === null;
  const ringkasan: RingkasanKader = ringkasanHasil ?? RINGKASAN_KOSONG;
  const limaBesar: BarisPeringkat = limaBesarHasil ?? [];

  const rincianTeks = ringkasan.rincian.length > 0
    ? ringkasan.rincian.map((r) => `${labelJenis(r.jenis)} x${r.jumlah}`).join(" - ")
    : (ringkasan.poinMingguIni > 0 ? "Poin dari periode sebelumnya" : "Belum ada aktivitas tercatat");

  const kartu: Array<{ label: string; nilai: string; sub: string; href?: string }> = [
    {
      label: "Poin Minggu Ini",
      nilai: String(ringkasan.poinMingguIni),
      sub: rincianTeks,
    },
    {
      label: "Peringkat",
      nilai: ringkasan.peringkat ? `#${ringkasan.peringkat}` : "-",
      sub: "Di antara kader aktif minggu ini",
      href: "/leaderboard",
    },
    {
      label: "Streak Aktif",
      nilai: ringkasan.streak > 0 ? `${ringkasan.streak} hari` : "-",
      sub: "Badge di 3 - 7 - 30 hari",
    },
    {
      label: "Lencana",
      nilai: String(ringkasan.jumlahBadge),
      sub: "Trophy case permanen",
      href: "/dasbor/pencapaian",
    },
  ];

  return (
    <div>
      {(ringkasanGagal || papanGagal) && (
        <p
          role="alert"
          className="mb-4 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          Sebagian data ringkasan belum dapat dimuat. Coba muat ulang halaman
          sebentar lagi.
        </p>
      )}
      <WidgetAktivitas />
      <KickerLabel>Dasbor Kader</KickerLabel>
      <h1 className="mt-2 font-serif text-3xl font-extrabold text-hitam-900">
        Ringkasan Perjuangan
      </h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-hitam-400">
        Periode {labelPeriodeMingguan()} - mulai {fmtTanggal(awalMingguBerjalan())}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map((k) => (
          <div key={k.label} className="border-2 border-hitam-900 bg-white p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gmnimerah-600">
              {k.label}
            </p>
            <p className="mt-1 font-serif text-3xl font-extrabold text-hitam-900">{k.nilai}</p>
            <p className="mt-1 text-xs text-hitam-500">{k.sub}</p>
            {k.href && (
              <Link
                href={k.href}
                className="mt-2 inline-block font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-600 hover:text-gmnimerah-700"
              >
                Lihat -&gt;
              </Link>
            )}
          </div>
        ))}
      </div>

      <section className="mt-8 border-2 border-hitam-900 bg-white">
        <div className="flex items-center justify-between border-b-2 border-hitam-900 px-4 py-3">
          <h2 className="font-serif text-lg font-bold text-hitam-900">Lima Besar Pekan Ini</h2>
          <Link
            href="/leaderboard"
            className="font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-600 hover:text-gmnimerah-700"
          >
            Papan Penuh -&gt;
          </Link>
        </div>
        {papanGagal ? (
          <p className="px-4 py-6 text-sm text-hitam-500">
            Papan peringkat belum dapat dimuat. Coba muat ulang halaman
            sebentar lagi.
          </p>
        ) : limaBesar.length === 0 ? (
          <p className="px-4 py-6 text-sm text-hitam-500">
            Belum ada poin tercatat minggu ini. Tulis artikel, berkomentar, atau kirim pesan untuk
            membuka papan peringkat.
          </p>
        ) : (
          <ol>
            {limaBesar.map((b, i) => (
              <li
                key={b.userId}
                className="flex items-center gap-3 border-b border-hitam-100 px-4 py-2.5 last:border-b-0"
              >
                <span className="w-8 font-mono text-sm font-bold text-hitam-400">
                  {String(i + 1).padStart(2, "0")}
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
                <span className="font-mono text-sm font-bold text-gmnimerah-600">
                  {b.totalPoin} pts
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
