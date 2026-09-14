"use client";

import { useState } from "react";
import { fmtRupiah } from "@/lib/monetisasi";
import { cn } from "@/lib/utils";

type DonasiData = {
  id: string;
  namaDonatur: string;
  nominal: number;
  pesan: string | null;
  status: string;
  createdAt: string;
  verifikasiOleh: { namaLengkap: string; username: string } | null;
};

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/** PanelDonasi — verifikasi donasi masuk + pencatatan manual offline. */
export function PanelDonasi({
  donasi,
  totalMenunggu,
  totalTerverifikasi,
  nominalTerverifikasi,
}: {
  donasi: DonasiData[];
  totalMenunggu: number;
  totalTerverifikasi: number;
  nominalTerverifikasi: number;
}) {
  const [eror, setEror] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  return (
    <div className="mt-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border-2 border-gmnimerah-500 bg-white p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-500">
            Menunggu Verifikasi
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-gmnimerah-600">{totalMenunggu}</p>
        </div>
        <div className="border-2 border-hitam-900 bg-white p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-500">
            Terverifikasi
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-hitam-900">{totalTerverifikasi}</p>
        </div>
        <div className="border-2 border-hitam-900 bg-hitam-900 p-4 text-white">
          <p className="font-mono text-[11px] uppercase tracking-widest text-kertas-300">
            Total Terkumpul
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">{fmtRupiah(nominalTerverifikasi)}</p>
        </div>
      </div>

      <div className="mt-4 border-2 border-hitam-900 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-hitam-900 bg-kertas-100 font-mono text-[11px] uppercase tracking-widest text-hitam-600">
                <th className="px-3 py-2">Donatur</th>
                <th className="px-3 py-2">Nominal</th>
                <th className="px-3 py-2">Pesan</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {donasi.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-hitam-500">
                    Belum ada donasi masuk.
                  </td>
                </tr>
              )}
              {donasi.map((d) => (
                <tr key={d.id} className="border-b border-hitam-100 align-top last:border-0">
                  <td className="px-3 py-2">
                    <p className="font-bold text-hitam-900">{d.namaDonatur}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-hitam-400">
                      {d.createdAt.slice(0, 10)}
                    </p>
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-hitam-900">
                    {fmtRupiah(d.nominal)}
                  </td>
                  <td className="max-w-[240px] truncate px-3 py-2 text-xs italic text-hitam-500">
                    {d.pesan ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <BadgeDonasi status={d.status} />
                  </td>
                  <td className="px-3 py-2">
                    {d.status === "MENUNGGU_VERIFIKASI" ? (
                      <div className="flex flex-wrap gap-1.5">
                        <TombolVerifikasi id={d.id} aksi="VERIFIKASI" label="Verifikasi" setPesan={setPesan} setEror={setEror} />
                        <TombolVerifikasi id={d.id} aksi="TOLAK" label="Tolak" setPesan={setPesan} setEror={setEror} />
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-hitam-400">
                        {d.verifikasiOleh ? `oleh ${d.verifikasiOleh.namaLengkap}` : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {eror && <p className="border-t-2 border-hitam-900 px-4 py-2 text-sm font-semibold text-gmnimerah-600">{eror}</p>}
        {pesan && <p className="border-t-2 border-hitam-900 px-4 py-2 text-sm font-semibold text-hitam-700">{pesan}</p>}
      </div>
      <FormDonasiManual setPesan={setPesan} setEror={setEror} />
    </div>
  );
}

function BadgeDonasi({ status }: { status: string }) {
  const warna =
    status === "TERVERIFIKASI"
      ? "bg-hitam-900 text-white"
      : status === "DITOLAK"
        ? "bg-kertas-200 text-hitam-500"
        : "bg-gmnimerah-100 text-gmnimerah-700";
  return (
    <span className={cn("inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest", warna)}>
      {status === "MENUNGGU_VERIFIKASI" ? "MENUNGGU" : status}
    </span>
  );
}

function TombolVerifikasi({
  id,
  aksi,
  label,
  setPesan,
  setEror,
}: {
  id: string;
  aksi: "VERIFIKASI" | "TOLAK";
  label: string;
  setPesan: SetState<string | null>;
  setEror: SetState<string | null>;
}) {
  async function jalan() {
    if (aksi === "TOLAK" && !window.confirm("Tolak donasi ini?")) return;
    setEror(null);
    setPesan(null);
    const res = await fetch(`/api/admin/donasi/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aksi }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setEror(data?.error ?? `Gagal memproses donasi.`);
      return;
    }
    setPesan(`Donasi ${label.toLowerCase()} — memuat ulang...`);
    window.location.reload();
  }
  const utama = aksi === "VERIFIKASI";
  return (
    <button
      type="button"
      onClick={jalan}
      className={cn(
        "border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest",
        utama
          ? "border-hitam-900 bg-hitam-900 text-white hover:bg-gmnimerah-600"
          : "border-gmnimerah-700 text-gmnimerah-700 hover:bg-gmnimerah-700 hover:text-white",
      )}
    >
      {label}
    </button>
  );
}

function FormDonasiManual({
  setPesan,
  setEror,
}: {
  setPesan: SetState<string | null>;
  setEror: SetState<string | null>;
}) {
  const [nama, setNama] = useState("");
  const [nominal, setNominal] = useState("");
  const [pesanInput, setPesanInput] = useState("");
  const [memuat, setMemuat] = useState(false);

  async function simpan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    setPesan(null);
    const res = await fetch("/api/admin/donasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        namaDonatur: nama.trim(),
        nominal: Number(nominal.replace(/[^0-9]/g, "")),
        pesan: pesanInput.trim() || null,
      }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setMemuat(false);
    if (!res.ok) {
      setEror(data?.error ?? "Gagal mencatat donasi manual.");
      return;
    }
    setPesan("Donasi offline tercatat & terverifikasi — memuat ulang...");
    window.location.reload();
  }

  return (
    <form onSubmit={simpan} className="mt-4 border-2 border-hitam-900 bg-kertas-50 p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
        Catat Donasi Offline (tunai/transfer langsung)
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="label-bidang">Nama Donatur</span>
          <input type="text" required minLength={2} maxLength={80} value={nama} onChange={(e) => setNama(e.target.value)} className="input-bidang" />
        </label>
        <label className="block">
          <span className="label-bidang">Nominal (Rp)</span>
          <input type="text" required inputMode="numeric" value={nominal} onChange={(e) => setNominal(e.target.value)} className="input-bidang font-mono" placeholder="100000" />
        </label>
        <label className="block">
          <span className="label-bidang">Pesan (opsional)</span>
          <input type="text" maxLength={500} value={pesanInput} onChange={(e) => setPesanInput(e.target.value)} className="input-bidang" />
        </label>
      </div>
      <button
        type="submit"
        disabled={memuat}
        className="mt-4 bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
      >
        {memuat ? "Mencatat..." : "Catat Donasi Offline"}
      </button>
    </form>
  );
}