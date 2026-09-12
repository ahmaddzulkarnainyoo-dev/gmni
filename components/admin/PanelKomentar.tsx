"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type KomentarAdmin = {
  id: string;
  isi: string;
  status: "TAMPIL" | "DISEMBUNYIKAN";
  jumlahLaporan: number;
  tanggal: string;
  namaTamu: string | null;
  artikel: { judul: string; slug: string };
  penulis: { id: string; namaLengkap: string; username: string } | null;
};

const FILTERS: Array<{ nilai: string; label: string }> = [
  { nilai: "SEMUA", label: "Semua" },
  { nilai: "DILAPORKAN", label: "Dilaporkan" },
  { nilai: "TAMPIL", label: "Tampil" },
  { nilai: "DISEMBUNYIKAN", label: "Tersembunyi" },
];

const GAYA_TOMBOL =
  "border-2 border-hitam-900 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-hitam-900 hover:text-white disabled:opacity-50";

/** Panel moderasi komentar (blueprint 8.3): sembunyikan/tampilkan/hapus/benarkan laporan. */
export function PanelKomentar({
  komentar,
  aktif,
}: {
  komentar: KomentarAdmin[];
  aktif: string;
}) {
  const router = useRouter();
  const [memuat, setMemuat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [eror, setEror] = useState<string | null>(null);

  async function aksi(
    id: string,
    kind: "SEMBUNYIKAN" | "TAMPILKAN" | "BENARKAN_LAPORAN",
  ) {
    if (kind === "SEMBUNYIKAN" && !confirm("Sembunyikan komentar ini dari publik?")) return;
    if (kind === "BENARKAN_LAPORAN" && !confirm("Tandai laporan komentar ini sudah ditangani?"))
      return;
    setMemuat(id);
    setPesan(null);
    setEror(null);
    try {
      const res = await fetch(`/api/admin/komentar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aksi: kind }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal memproses komentar.");
        return;
      }
      setPesan("Perubahan tersimpan.");
      router.refresh();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(null);
    }
  }

  async function hapus(id: string) {
    if (!confirm("Hapus komentar ini secara permanen? Tindakan tidak bisa dibatalkan.")) return;
    setMemuat(id);
    setPesan(null);
    setEror(null);
    try {
      const res = await fetch(`/api/admin/komentar/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal menghapus komentar.");
        return;
      }
      setPesan("Komentar dihapus.");
      router.refresh();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(null);
    }
  }
return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.nilai}
            href={
              f.nilai === "SEMUA"
                ? "/admin/komentar"
                : `/admin/komentar?status=${f.nilai}`
            }
            className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
              aktif === f.nilai
                ? "bg-hitam-900 text-white"
                : "border border-hitam-300 text-hitam-600 hover:border-hitam-900 hover:text-hitam-900"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {pesan && (
        <p
          role="status"
          className="mt-4 border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800"
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

      {komentar.length === 0 ? (
        <p className="mt-8 border-2 border-dashed border-hitam-300 p-8 text-center text-sm text-hitam-500">
          Tidak ada komentar pada filter ini.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {komentar.map((k) => (
            <li key={k.id} className="border-2 border-hitam-900 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/artikel/${k.artikel.slug}`}
                  className="font-serif text-sm font-bold text-hitam-900 hover:text-gmnimerah-600"
                >
                  {k.artikel.judul}
                </Link>
                {k.status === "DISEMBUNYIKAN" && (
                  <span className="bg-hitam-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
                    Tersembunyi
                  </span>
                )}
                {k.jumlahLaporan > 0 && (
                  <span className="bg-gmnimerah-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gmnimerah-700">
                    Dilaporkan {k.jumlahLaporan}×
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-hitam-800">
                {k.isi}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-widest text-hitam-500">
                  {k.penulis ? k.penulis.namaLengkap : k.namaTamu} ·{" "}
                  {new Date(k.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {k.status === "TAMPIL" ? (
                    <button
                      onClick={() => aksi(k.id, "SEMBUNYIKAN")}
                      disabled={memuat === k.id}
                      className={GAYA_TOMBOL}
                    >
                      Sembunyikan
                    </button>
                  ) : (
                    <button
                      onClick={() => aksi(k.id, "TAMPILKAN")}
                      disabled={memuat === k.id}
                      className={GAYA_TOMBOL}
                    >
                      Tampilkan
                    </button>
                  )}
                  {k.jumlahLaporan > 0 && (
                    <button
                      onClick={() => aksi(k.id, "BENARKAN_LAPORAN")}
                      disabled={memuat === k.id}
                      className={GAYA_TOMBOL}
                    >
                      Benarkan Laporan
                    </button>
                  )}
                  <button
                    onClick={() => hapus(k.id)}
                    disabled={memuat === k.id}
                    className={GAYA_TOMBOL}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}