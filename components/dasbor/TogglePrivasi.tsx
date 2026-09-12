"use client";

import { useState } from "react";

/** Toggle privasi profil: sembunyikan dari pencarian publik & DM (blueprint 6.2). */
export function TogglePrivasi({ aktif }: { aktif: boolean }) {
  const [nilai, setNilai] = useState(aktif);
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function toggle() {
    if (memuat) return;
    const baru = !nilai;
    setNilai(baru); // optimistik
    setMemuat(true);
    setEror(null);
    setInfo(null);
    try {
      const res = await fetch("/api/me/pengaturan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilTersembunyi: baru }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setNilai(!baru);
        setEror(data.error ?? "Gagal menyimpan pengaturan.");
        return;
      }
      setInfo(
        baru
          ? "Profil Anda kini tersembunyi dari pencarian publik dan pesan langsung (DM)."
          : "Profil Anda kembali tampil di pencarian publik dan dapat menerima pesan langsung (DM).",
      );
    } catch {
      setNilai(!baru);
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="mt-6 border-2 border-hitam-900 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-lg font-bold text-hitam-900">Privasi Profil</p>
          <p className="mt-1 text-sm text-hitam-500">
            Sembunyikan profil dari pencarian publik & pesan langsung (DM). Tulisan serta komentar
            yang sudah terbit tetap tampil.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={nilai}
          onClick={toggle}
          disabled={memuat}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            nilai ? "bg-gmnimerah-500" : "bg-hitam-300"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              nilai ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
        {nilai ? "Profil tersembunyi" : "Profil tampil di publik"}
      </p>

      {info && (
        <p
          role="status"
          className="mt-3 border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800"
        >
          {info}
        </p>
      )}
      {eror && (
        <p
          role="alert"
          className="mt-3 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          {eror}
        </p>
      )}
    </div>
  );
}