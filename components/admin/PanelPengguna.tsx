"use client";

import { useState } from "react";

type PenggunaData = {
  id: string;
  namaLengkap: string;
  email: string;
  username: string;
  statusAkun: "AKTIF" | "PENDING" | "SUSPEND";
  roleNama: string;
  tokenUndangan: string | null;
  diundangOlehEmail: string | null;
  tanggalBergabung: string | null;
};

/** Kelola kader: buat undangan, salin tautan, tangguhkan/aktifkan. */
export function PanelPengguna({
  pengguna,
  bisaUndang,
  bisaSuspend,
}: {
  pengguna: PenggunaData[];
  bisaUndang: boolean;
  bisaSuspend: boolean;
}) {
  const [link, setLink] = useState<Record<string, string>>({});
  const [memuat, setMemuat] = useState<Record<string, string>>({});
  const [eror, setEror] = useState<Record<string, string>>({});

  async function buatUndangan(id: string) {
    setMemuat((m) => ({ ...m, [id]: "undang" }));
    setEror((e) => ({ ...e, [id]: "" }));
    try {
      const res = await fetch(`/api/admin/pengguna/${id}/undangan`, { method: "POST" });
      const data = (await res.json()) as { error?: string; linkUndangan?: string };
      if (!res.ok || !data.linkUndangan) {
        setEror((e) => ({ ...e, [id]: data.error ?? "Gagal membuat undangan." }));
        return;
      }
      setLink((l) => ({ ...l, [id]: data.linkUndangan! }));
    } catch {
      setEror((e) => ({ ...e, [id]: "Tidak dapat menghubungi server." }));
    } finally {
      setMemuat((m) => ({ ...m, [id]: "" }));
    }
  }

  async function gantiStatus(u: PenggunaData) {
    setMemuat((m) => ({ ...m, [u.id]: "suspend" }));
    setEror((e) => ({ ...e, [u.id]: "" }));
    try {
      const res = await fetch(`/api/admin/pengguna/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusAkun: u.statusAkun === "AKTIF" ? "SUSPEND" : "AKTIF" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEror((e) => ({ ...e, [u.id]: data.error ?? "Gagal mengubah status." }));
        return;
      }
      window.location.reload();
    } catch {
      setEror((e) => ({ ...e, [u.id]: "Tidak dapat menghubungi server." }));
    } finally {
      setMemuat((m) => ({ ...m, [u.id]: "" }));
    }
  }

  if (pengguna.length === 0) {
    return (
      <div className="mt-6 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
        <p className="font-serif text-xl font-bold text-hitam-900">Belum ada kader.</p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {pengguna.map((u) => (
        <li key={u.id} className="border border-hitam-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                    u.statusAkun === "AKTIF"
                      ? "border-hitam-900 bg-kertas-200 text-hitam-700"
                      : u.statusAkun === "PENDING"
                        ? "border-hitam-900 bg-hitam-900 text-white"
                        : "border-gmnimerah-700 bg-gmnimerah-50 text-gmnimerah-700"
                  }`}
                >
                  {u.statusAkun === "AKTIF"
                    ? "Aktif"
                    : u.statusAkun === "PENDING"
                      ? "Menunggu Verifikasi"
                      : "Ditangguhkan"}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-hitam-400">
                  {u.roleNama}
                </span>
              </div>
              <p className="mt-2 font-serif text-lg font-bold text-hitam-900">
                {u.namaLengkap}
              </p>
              <p className="text-sm text-hitam-500">
                {u.email} · @{u.username}
              </p>
              {u.diundangOlehEmail && (
                <p className="font-mono text-[11px] uppercase tracking-wider text-hitam-400">
                  Diundang oleh {u.diundangOlehEmail}
                </p>
              )}
              {eror[u.id] && (
                <p role="alert" className="mt-2 text-sm font-semibold text-gmnimerah-700">
                  {eror[u.id]}
                </p>
              )}
              {link[u.id] && (
                <div className="mt-3 border-2 border-gmnimerah-500 bg-gmnimerah-50 p-3">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-700">
                    Tautan Undangan (sekali pakai)
                  </p>
                  <input
                    readOnly
                    value={link[u.id]}
                    onFocus={(e) => e.target.select()}
                    className="mt-1 w-full border border-hitam-300 bg-white px-2 py-1.5 font-mono text-[12px] text-hitam-900"
                  />
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              {bisaUndang && (
                <button
                  type="button"
                  disabled={memuat[u.id] === "undang"}
                  onClick={() => buatUndangan(u.id)}
                  className="bg-hitam-900 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
                >
                  {memuat[u.id] === "undang" ? "Membuat..." : "Buat Undangan"}
                </button>
              )}
              {bisaSuspend && (
                <button
                  type="button"
                  disabled={memuat[u.id] === "suspend"}
                  onClick={() => gantiStatus(u)}
                  className={`border-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
                    u.statusAkun === "AKTIF"
                      ? "border-gmnimerah-700 text-gmnimerah-700 hover:bg-gmnimerah-700 hover:text-white"
                      : "border-hitam-900 text-hitam-900 hover:bg-hitam-900 hover:text-white"
                  }`}
                >
                  {memuat[u.id] === "suspend"
                    ? "Memproses..."
                    : u.statusAkun === "AKTIF"
                      ? "Tangguhkan"
                      : "Aktifkan"}
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}