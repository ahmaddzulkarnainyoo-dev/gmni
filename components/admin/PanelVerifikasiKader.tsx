"use client";

import { useState } from "react";

type PendaftarData = {
  id: string;
  namaLengkap: string;
  email: string;
  username: string;
  cabangKomisariat: string | null;
  tanggalBergabung: string;
};

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Verifikasi pendaftaran kader: Setujui (→ AKTIF) atau Tolak (→ SUSPEND). */
export function PanelVerifikasiKader({
  pendaftar,
}: {
  pendaftar: PendaftarData[];
}) {
  const [memuat, setMemuat] = useState<Record<string, string>>({});
  const [eror, setEror] = useState<Record<string, string>>({});

  async function putuskan(id: string, statusAkun: "AKTIF" | "SUSPEND", konfirmasi?: string) {
    if (konfirmasi && !window.confirm(konfirmasi)) return;
    setMemuat((m) => ({ ...m, [id]: statusAkun }));
    setEror((e) => ({ ...e, [id]: "" }));
    try {
      const res = await fetch(`/api/admin/pengguna/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusAkun }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEror((e) => ({ ...e, [id]: data.error ?? "Gagal memproses verifikasi." }));
        return;
      }
      window.location.reload();
    } catch {
      setEror((e) => ({ ...e, [id]: "Tidak dapat menghubungi server." }));
    } finally {
      setMemuat((m) => ({ ...m, [id]: "" }));
    }
  }

  if (pendaftar.length === 0) {
    return (
      <div className="mt-6 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
        <p className="font-serif text-xl font-bold text-hitam-900">
          Tidak ada pendaftaran menunggu.
        </p>
        <p className="mt-1 text-sm text-hitam-500">
          Semua calon kader sudah diverifikasi. Kerja bagus, Bung!
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {pendaftar.map((u) => (
        <li key={u.id} className="border-2 border-hitam-900 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="border border-hitam-900 bg-kertas-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-hitam-700">
                Menunggu Verifikasi
              </span>
              <p className="mt-2 font-serif text-lg font-bold text-hitam-900">
                {u.namaLengkap}
              </p>
              <p className="text-sm text-hitam-500">
                {u.email}
                <span className="text-hitam-400"> · @{u.username}</span>
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-hitam-500">
                {u.cabangKomisariat ?? "Cabang belum diisi"}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-hitam-400">
                Mendaftar {formatTanggal(u.tanggalBergabung)}
              </p>
              {eror[u.id] && (
                <p role="alert" className="mt-2 text-sm font-semibold text-gmnimerah-700">
                  {eror[u.id]}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              <button
                type="button"
                disabled={memuat[u.id] !== ""}
                onClick={() => putuskan(u.id, "AKTIF")}
                className="min-h-11 bg-gmnimerah-500 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
              >
                {memuat[u.id] === "AKTIF" ? "Menyetujui..." : "Setujui"}
              </button>
              <button
                type="button"
                disabled={memuat[u.id] !== ""}
                onClick={() =>
                  putuskan(u.id, "SUSPEND", `Tolak pendaftaran ${u.namaLengkap}? Akun diset SUSPEND.`)
                }
                className="min-h-11 border-2 border-hitam-900 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white disabled:opacity-50"
              >
                {memuat[u.id] === "SUSPEND" ? "Menolak..." : "Tolak"}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}