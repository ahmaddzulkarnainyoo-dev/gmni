"use client";

import { useState } from "react";

/** FormDonasi — form donasi publik (nama, nominal rupiah, pesan opsional). */
export function FormDonasi() {
  const [nama, setNama] = useState("");
  const [nominal, setNominal] = useState("");
  const [pesan, setPesan] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    try {
      const res = await fetch("/api/donasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaDonatur: nama.trim(),
          nominal: Number(nominal.replace(/[^0-9]/g, "")),
          pesan: pesan.trim() || null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal mengirim donasi.");
        return;
      }
      setSukses(true);
      setNama("");
      setNominal("");
      setPesan("");
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  if (sukses) {
    return (
      <div className="border-2 border-hitam-900 bg-kertas-100 p-6 text-center">
        <p className="font-serif text-xl font-bold text-hitam-900">
          Terima kasih, Bung!
        </p>
        <p className="mt-2 text-sm text-hitam-600">
          Donasi dicatat dan menunggu verifikasi bendahara. Nama baikmu akan
          tampil di papan transparansi setelah diverifikasi.
        </p>
        <button
          type="button"
          onClick={() => setSukses(false)}
          className="mt-4 border-2 border-hitam-900 bg-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white"
        >
          Kirim Lagi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={kirim} className="border-2 border-hitam-900 bg-white p-5 md:p-6">
      <label className="block">
        <span className="label-bidang">Nama Donatur</span>
        <input
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="input-bidang"
          placeholder="Nama atau alias perjuangan"
        />
      </label>
      <label className="mt-4 block">
        <span className="label-bidang">Nominal (Rupiah)</span>
        <input
          type="text"
          required
          inputMode="numeric"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          className="input-bidang font-mono"
          placeholder="Contoh: 50000"
        />
        <span className="mt-1 block font-mono text-[11px] text-hitam-400">
          Minimal Rp1.000 — transfer dulu, lalu catat di sini.
        </span>
      </label>
      <label className="mt-4 block">
        <span className="label-bidang">Pesan (opsional)</span>
        <textarea
          rows={3}
          maxLength={500}
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          className="input-bidang resize-y"
          placeholder="Merdeka! Untuk pers yang merdeka..."
        />
      </label>
      {eror && <p className="mt-3 text-sm font-semibold text-gmnimerah-600">{eror}</p>}
      <button
        type="submit"
        disabled={memuat}
        className="mt-5 w-full bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
      >
        {memuat ? "Mengirim..." : "Catat Donasi Saya"}
      </button>
    </form>
  );
}
