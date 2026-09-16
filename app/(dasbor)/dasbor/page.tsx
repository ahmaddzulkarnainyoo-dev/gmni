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


/** Label Indonesia untuk jenis aktivitas ledger (transparansi poin). */
function labelJenis(jenis: string): string {
  if (jenis === "ARTIKEL_TERBIT") return "Artikel terbit";
  if (jenis === "KOMENTAR_TAMPIL") return "Komentar";
  return "Harian";
}

export const dynamic = "force-dynamic";

/**
 * Dasbor kader ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ringkasan gamifikasi mingguan (blueprint 8.4):
 * poin minggu ini, peringkat, streak, badge + mini board top-5.
 */
export default async function DasborPage() {
  const user = await requireAuthUser();
  await evaluasiBadgeKader(user.id);
  const [ringkasan, limaBesar] = await Promise.all([
    ambilRingkasanKader(user.id),
    ambilPeringkatMingguan(5),
  ]);

  const rincianTeks = ringkasan.rincian.length > 0
    ? ringkasan.rincian.map((r) => `${labelJenis(r.jenis)} Ãƒâ€”${r.jumlah}`).join(" Ã‚Â· ")
    : (ringkasan.poinMingguIni > 0 ? "Poin dari periode sebelumnya" : "Belum ada aktivitas tercatat");

  const kartu: Array<{ label: string; nilai: string; sub: string; href?: string }> = [
    {
      label: "Poin Minggu Ini",
      nilai: String(ringkasan.poinMingguIni),
      sub: `Artikel 10 Ã‚Â· Komentar 2 Ã‚Â· Harian 1 Ã¢â‚¬â€ ${rincianTeks}`,
    },
    {
      label: "Peringkat",
      nilai: ringkasan.peringkat ? `#${ringkasan.peringkat}` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
      sub: "Di antara kader aktif minggu ini",
      href: "/leaderboard",
    },
    {
      label: "Streak Aktif",
      nilai: ringkasan.streak > 0 ? `${ringkasan.streak} hari` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
      sub: "Badge di 3 Ãƒâ€šÃ‚Â· 7 Ãƒâ€šÃ‚Â· 30 hari",
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
      <WidgetAktivitas />
      <KickerLabel>Dasbor Kader</KickerLabel>
      <h1 className="mt-2 font-serif text-3xl font-extrabold text-hitam-900">
        Ringkasan Perjuangan
      </h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-hitam-400">
        Periode {labelPeriodeMingguan()} Ãƒâ€šÃ‚Â· mulai {fmtTanggal(awalMingguBerjalan())}
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
                Lihat ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢
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
            Papan Penuh ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢
          </Link>
        </div>
        {limaBesar.length === 0 ? (
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
