"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type IklanData = {
  id: string;
  nama: string;
  gambarUrl: string;
  tautanUrl: string;
  lokasiSlot: string;
  urutan: number;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
  jumlahKlik: number;
};

/** PanelIklan — CRUD banner slot iklan mandiri untuk admin. */
export function PanelIklan({ iklan }: { iklan: IklanData[] }) {
  const [pilihId, setPilihId] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  return (
    <div className="mt-4 border-2 border-hitam-900 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-hitam-900 bg-kertas-100 font-mono text-[11px] uppercase tracking-widest text-hitam-600">
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Slot</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Klik</th>
              <th className="px-3 py-2">Tayang</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {iklan.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-hitam-500">
                  Belum ada iklan. Tambahkan banner pertama di bawah.
                </td>
              </tr>
            )}
            {iklan.map((i) => (
              <tr key={i.id} className="border-b border-hitam-100 last:border-0">
                <td className="px-3 py-2 font-bold text-hitam-900">{i.nama}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{i.lokasiSlot}</td>
                <td className="px-3 py-2">
                  <BadgeStatus status={i.status} />
                </td>
                <td className="px-3 py-2 font-mono">{i.jumlahKlik}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-hitam-500">
                  {potongTanggal(i.tanggalMulai)} → {potongTanggal(i.tanggalSelesai)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {i.status !== "AKTIF" && (
                      <Aksi id={i.id} aksi={{ status: "AKTIF" }} label="Aktifkan" setPesan={setPesan} setEror={setEror} />
                    )}
                    {i.status === "AKTIF" && (
                      <Aksi id={i.id} aksi={{ status: "DIARSIPKAN" }} label="Arsipkan" setPesan={setPesan} setEror={setEror} />
                    )}
                    <button
                      type="button"
                      onClick={() => muatForm(i, { setPilihId })}
                      className="border border-hitam-900 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-hitam-900 hover:text-white"
                    >
                      Edit
                    </button>
                    <Hapus id={i.id} nama={i.nama} setPesan={setPesan} setEror={setEror} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {eror && <p className="border-t-2 border-hitam-900 px-4 py-2 text-sm font-semibold text-gmnimerah-600">{eror}</p>}
      {pesan && <p className="border-t-2 border-hitam-900 px-4 py-2 text-sm font-semibold text-hitam-700">{pesan}</p>}
      <FormIklan
        pilihId={pilihId}
        setPilihId={setPilihId}
        memuat={memuat}
        setMemuat={setMemuat}
        mengunggah={mengunggah}
        setMengunggah={setMengunggah}
        setEror={setEror}
        setPesan={setPesan}
      />
    </div>
  );
}

function BadgeStatus({ status }: { status: string }) {
  const warna =
    status === "AKTIF"
      ? "bg-hitam-900 text-white"
      : status === "DIARSIPKAN"
        ? "bg-kertas-200 text-hitam-500"
        : "bg-gmnimerah-100 text-gmnimerah-700";
  return (
    <span className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${warna}`}>
      {status}
    </span>
  );
}

function potongTanggal(v: string | null): string {
  if (!v) return "∞";
  return v.slice(0, 10);
}

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

function muatForm(
  i: IklanData,
  s: { setPilihId: SetState<string | null> },
) {
  s.setPilihId(i.id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("iklan:edit", { detail: i }));
  }
}

function Aksi({
  id,
  aksi,
  label,
  setPesan,
  setEror,
}: {
  id: string;
  aksi: Record<string, unknown>;
  label: string;
  setPesan: SetState<string | null>;
  setEror: SetState<string | null>;
}) {
  async function jalan() {
    setEror(null);
    setPesan(null);
    const res = await fetch(`/api/admin/iklan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aksi),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setEror(data?.error ?? `Gagal: ${label}.`);
      return;
    }
    setPesan(`Iklan ${label.toLowerCase()} — memuat ulang...`);
    window.location.reload();
  }
  return (
    <button
      type="button"
      onClick={jalan}
      className="border border-hitam-900 bg-hitam-900 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-gmnimerah-600"
    >
      {label}
    </button>
  );
}

function Hapus({
  id,
  nama,
  setPesan,
  setEror,
}: {
  id: string;
  nama: string;
  setPesan: SetState<string | null>;
  setEror: SetState<string | null>;
}) {
  async function jalan() {
    if (!window.confirm(`Hapus iklan "${nama}" permanen?`)) return;
    setEror(null);
    setPesan(null);
    const res = await fetch(`/api/admin/iklan/${id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setEror(data?.error ?? "Gagal menghapus iklan.");
      return;
    }
    setPesan("Iklan dihapus — memuat ulang...");
    window.location.reload();
  }
  return (
    <button
      type="button"
      onClick={jalan}
      className="border border-gmnimerah-700 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gmnimerah-700 hover:bg-gmnimerah-700 hover:text-white"
    >
      Hapus
    </button>
  );
}

type PropsForm = {
  pilihId: string | null;
  setPilihId: SetState<string | null>;
  memuat: boolean;
  setMemuat: SetState<boolean>;
  mengunggah: boolean;
  setMengunggah: SetState<boolean>;
  setEror: SetState<string | null>;
  setPesan: SetState<string | null>;
};

function FormIklan(p: PropsForm) {
  const { pilihId, setPilihId, memuat, setMemuat, mengunggah, setMengunggah, setEror, setPesan } = p;
  const [nama, setNama] = useState("");
  const [gambarUrl, setGambarUrl] = useState("");
  const [tautanUrl, setTautanUrl] = useState("");
  const [lokasiSlot, setLokasiSlot] = useState("HEADER");
  const [status, setStatus] = useState("DRAFT");
  const [urutan, setUrutan] = useState("0");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  useEffect(() => {
    function tangani(ev: Event) {
      const d = (ev as CustomEvent).detail as IklanData;
      setNama(d.nama);
      setGambarUrl(d.gambarUrl);
      setTautanUrl(d.tautanUrl);
      setLokasiSlot(d.lokasiSlot);
      setStatus(d.status);
      setUrutan(String(d.urutan));
      setTanggalMulai(d.tanggalMulai ? d.tanggalMulai.slice(0, 10) : "");
      setTanggalSelesai(d.tanggalSelesai ? d.tanggalSelesai.slice(0, 10) : "");
      setEror(null);
      setPesan(null);
    }
    window.addEventListener("iklan:edit", tangani);
    return () => window.removeEventListener("iklan:edit", tangani);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unggah(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMengunggah(true);
    setEror(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        setEror(data.error ?? "Upload gagal — gunakan URL manual.");
        return;
      }
      setGambarUrl(data.url);
      setPesan("Banner berhasil diunggah.");
    } catch {
      setEror("Tidak dapat menghubungi server untuk upload.");
    } finally {
      setMengunggah(false);
    }
  }

  async function simpan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    setPesan(null);
    const payload = {
      nama,
      gambarUrl: gambarUrl || null,
      tautanUrl,
      lokasiSlot,
      status,
      urutan: Number(urutan) || 0,
      tanggalMulai: tanggalMulai || null,
      tanggalSelesai: tanggalSelesai || null,
    };
    const url = pilihId ? `/api/admin/iklan/${pilihId}` : "/api/admin/iklan";
    const res = await fetch(url, {
      method: pilihId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setMemuat(false);
    if (!res.ok) {
      setEror(data?.error ?? "Gagal menyimpan iklan.");
      return;
    }
    setPesan("Iklan tersimpan — memuat ulang...");
    window.location.reload();
  }

  function buatBaru() {
    setPilihId(null);
    setNama("");
    setGambarUrl("");
    setTautanUrl("");
    setLokasiSlot("HEADER");
    setStatus("DRAFT");
    setUrutan("0");
    setTanggalMulai("");
    setTanggalSelesai("");
    setEror(null);
    setPesan(null);
  }

  return (
    <form onSubmit={simpan} className="border-t-2 border-hitam-900 bg-kertas-50 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
          {pilihId ? "Edit Banner" : "Banner Baru"}
        </p>
        {pilihId && (
          <button
            type="button"
            onClick={buatBaru}
            className="font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-600 hover:underline"
          >
            + Baru
          </button>
        )}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label-bidang">Nama Iklan</span>
          <input type="text" required minLength={3} maxLength={120} value={nama} onChange={(e) => setNama(e.target.value)} className="input-bidang" placeholder="UMKM Marhaen — Header" />
        </label>
        <label className="block">
          <span className="label-bidang">Tautan Tujuan (http/https)</span>
          <input type="url" required value={tautanUrl} onChange={(e) => setTautanUrl(e.target.value)} className="input-bidang" placeholder="https://..." />
        </label>
      </div>
      <div className="mt-4">
        <span className="label-bidang">Banner (unggah atau URL)</span>
        {gambarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gambarUrl} alt="Pratinjau banner" className="mb-2 h-20 w-auto border-2 border-hitam-900 object-contain" />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={mengunggah}
          onChange={unggah}
          className="w-full max-w-sm border border-hitam-300 bg-white px-2 py-1.5 text-sm file:mr-2 file:border-0 file:bg-hitam-900 file:px-3 file:py-1.5 file:text-white"
        />
        <input
          type="text"
          value={gambarUrl}
          onChange={(e) => setGambarUrl(e.target.value)}
          className="input-bidang mt-2"
          placeholder="...atau tempel URL banner"
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <label className="block">
          <span className="label-bidang">Slot</span>
          <select value={lokasiSlot} onChange={(e) => setLokasiSlot(e.target.value)} className="input-bidang">
            <option value="HEADER">Header</option>
            <option value="SIDEBAR">Sidebar</option>
          </select>
        </label>
        <label className="block">
          <span className="label-bidang">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-bidang">
            <option value="DRAFT">Draft</option>
            <option value="AKTIF">Aktif (tayang)</option>
            <option value="DIARSIPKAN">Diarsipkan</option>
          </select>
        </label>
        <label className="block">
          <span className="label-bidang">Urutan</span>
          <input type="number" min={0} value={urutan} onChange={(e) => setUrutan(e.target.value)} className="input-bidang" />
        </label>
        <label className="block">
          <span className="label-bidang">Mulai (opsional)</span>
          <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="input-bidang" />
        </label>
      </div>
      <label className="mt-4 block max-w-sm">
        <span className="label-bidang">Selesai (opsional)</span>
        <input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="input-bidang" />
      </label>
      <button
        type="submit"
        disabled={memuat || mengunggah}
        className={cn(
          "mt-5 bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50",
        )}
      >
        {memuat ? "Menyimpan..." : pilihId ? "Simpan Perubahan" : "Simpan Iklan"}
      </button>
    </form>
  );
}