"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LaporanKomentar = {
  id: string;
  isi: string;
  status: "TAMPIL" | "DISEMBUNYIKAN";
  jumlahLaporan: number;
  tanggal: string;
  namaTamu: string | null;
  artikel: { judul: string; slug: string };
  penulis: { id: string; namaLengkap: string; username: string } | null;
};

const GAYA_TOMBOL =
  "border-2 border-hitam-900 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-hitam-900 hover:text-white disabled:opacity-50";

const GAYA_TOMBOL_BAHAYA =
  "border-2 border-gmnimerah-700 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-700 transition-colors hover:bg-gmnimerah-700 hover:text-white disabled:opacity-50";

type AksiModerasi = "SEMBUNYIKAN" | "TAMPILKAN" | "BENARKAN_LAPORAN";

/** Tabel rekap laporan komentar: sembunyikan / abaikan laporan / hapus (blueprint 8.3). */
export function TabelLaporan({ laporan }: { laporan: LaporanKomentar[] }) {
  const router = useRouter();
  const [memuat, setMemuat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [eror, setEror] = useState<string | null>(null);

  async function kirim(
    id: string,
    opsi: { method: "PATCH" | "DELETE"; aksi?: AksiModerasi; pesanOk: string },
  ) {
    setMemuat(id);
    setPesan(null);
    setEror(null);
    try {
      const res = await fetch(`/api/admin/komentar/${id}`, {
        method: opsi.method,
        ...(opsi.aksi
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ aksi: opsi.aksi }),
            }
          : {}),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal memproses laporan.");
        return;
      }
      setPesan(opsi.pesanOk);
      router.refresh();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(null);
    }
  }

  async function sembunyikan(id: string) {
    if (!confirm("Sembunyikan komentar ini dari publik?")) return;
    await kirim(id, {
      method: "PATCH",
      aksi: "SEMBUNYIKAN",
      pesanOk: "Komentar disembunyikan dari publik.",
    });
  }

  async function tampilkan(id: string) {
    await kirim(id, {
      method: "PATCH",
      aksi: "TAMPILKAN",
      pesanOk: "Komentar ditampilkan kembali.",
    });
  }

  async function abaikan(id: string) {
    if (!confirm("Abaikan laporan komentar ini (reset jumlah laporan ke 0)?"))
      return;
    await kirim(id, {
      method: "PATCH",
      aksi: "BENARKAN_LAPORAN",
      pesanOk: "Laporan diabaikan — jumlah laporan di-reset.",
    });
  }

  async function hapus(id: string) {
    if (
      !confirm(
        "Hapus komentar ini secara permanen? Tindakan tidak bisa dibatalkan.",
      )
    )
      return;
    await kirim(id, {
      method: "DELETE",
      pesanOk: "Komentar dihapus permanen.",
    });
  }

  return (
    <div className="mt-6">
      {pesan && (
        <p
          role="status"
          className="border-2 border-hitam-900 bg-kertas-100 px-3 py-2 text-sm font-semibold text-hitam-800"
        >
          {pesan}
        </p>
      )}
      {eror && (
        <p
          role="alert"
          className="mt-4 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          {eror}
        </p>
      )}

      {laporan.length === 0 ? (
        <p className="mt-6 border-2 border-dashed border-hitam-300 p-8 text-center text-sm text-hitam-500">
          Tidak ada komentar yang dilaporkan. Semua diskusi bersih.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto border-2 border-hitam-900 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-hitam-900 font-mono text-[11px] uppercase tracking-widest text-white">
                <th scope="col" className="px-3 py-2">
                  Komentar
                </th>
                <th scope="col" className="px-3 py-2">
                  Penulis
                </th>
                <th scope="col" className="px-3 py-2">
                  Laporan
                </th>
                <th scope="col" className="px-3 py-2">
                  Status
                </th>
                <th scope="col" className="px-3 py-2">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {laporan.map((l) => (
                <tr key={l.id} className="border-t border-hitam-100 align-top">
                  <td className="max-w-xs px-3 py-3">
                    <Link
                      href={`/artikel/${l.artikel.slug}`}
                      className="font-serif text-sm font-bold text-hitam-900 hover:text-gmnimerah-600"
                    >
                      {l.artikel.judul}
                    </Link>
                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-hitam-600">
                      {l.isi}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-hitam-400">
                      {new Date(l.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-[12px] uppercase tracking-wider text-hitam-600">
                    {l.penulis ? l.penulis.namaLengkap : l.namaTamu}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="bg-gmnimerah-100 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-700">
                      {l.jumlahLaporan}×
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {l.status === "DISEMBUNYIKAN" ? (
                      <span className="bg-hitam-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
                        Tersembunyi
                      </span>
                    ) : (
                      <span className="border border-hitam-300 bg-kertas-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-hitam-600">
                        Tampil
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      {l.status === "TAMPIL" ? (
                        <button
                          type="button"
                          onClick={() => sembunyikan(l.id)}
                          disabled={memuat === l.id}
                          className={GAYA_TOMBOL}
                        >
                          Sembunyikan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => tampilkan(l.id)}
                          disabled={memuat === l.id}
                          className={GAYA_TOMBOL}
                        >
                          Tampilkan
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => abaikan(l.id)}
                        disabled={memuat === l.id}
                        className={GAYA_TOMBOL}
                      >
                        Abaikan Laporan
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(l.id)}
                        disabled={memuat === l.id}
                        className={GAYA_TOMBOL_BAHAYA}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
