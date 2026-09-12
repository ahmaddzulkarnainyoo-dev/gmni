"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

type TokohData = {
  id: string;
  nama: string;
  slug: string;
  julukan: string | null;
  gambar: string | null;
  biografi: string;
  kutipan: string | null;
  lahir: number | null;
  wafat: number | null;
  status: string;
  urutan: number;
};

/** CRUD tokoh Marhaenis untuk admin (Super Admin/Editor). */
export function PanelTokoh({ tokoh }: { tokoh: TokohData[] }) {
  const [pilihId, setPilihId] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDibuat, setSlugDibuat] = useState(false);
  const [julukan, setJulukan] = useState("");
  const [gambar, setGambar] = useState("");
  const [biografi, setBiografi] = useState("");
  const [kutipan, setKutipan] = useState("");
  const [lahir, setLahir] = useState("");
  const [wafat, setWafat] = useState("");
  const [status, setStatus] = useState("AKTIF");
  const [urutan, setUrutan] = useState("0");
  const [memuat, setMemuat] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  const terpilih = tokoh.find((t) => t.id === pilihId) ?? null;

  function muat(t: TokohData) {
    setPilihId(t.id);
    setNama(t.nama);
    setSlug(t.slug);
    setSlugDibuat(true);
    setJulukan(t.julukan ?? "");
    setGambar(t.gambar ?? "");
    setBiografi(t.biografi);
    setKutipan(t.kutipan ?? "");
    setLahir(t.lahir?.toString() ?? "");
    setWafat(t.wafat?.toString() ?? "");
    setStatus(t.status);
    setUrutan(String(t.urutan));
    setEror(null);
    setPesan(null);
  }

  function buatBaru() {
    setPilihId(null);
    setNama("");
    setSlug("");
    setSlugDibuat(false);
    setJulukan("");
    setGambar("");
    setBiografi("");
    setKutipan("");
    setLahir("");
    setWafat("");
    setStatus("AKTIF");
    setUrutan("0");
    setEror(null);
    setPesan(null);
  }

  function gantiNama(v: string) {
    setNama(v);
    if (!slugDibuat) setSlug(slugify(v));
  }

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
      setGambar(data.url);
      setPesan("Foto berhasil diunggah.");
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
      slug: slug || undefined,
      julukan: julukan || null,
      gambar: gambar || null,
      biografi,
      kutipan: kutipan || null,
      lahir: lahir && Number(lahir) ? Number(lahir) : null,
      wafat: wafat && Number(wafat) ? Number(wafat) : null,
      status,
      urutan: Number(urutan) || 0,
    };
    try {
      const url = pilihId ? `/api/admin/tokoh/${pilihId}` : "/api/admin/tokoh";
      const res = await fetch(url, {
        method: pilihId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal menyimpan tokoh.");
        return;
      }
      setPesan(pilihId ? "Perubahan tokoh disimpan." : "Tokoh baru berhasil ditambahkan.");
      window.location.reload();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  async function hapus() {
    if (!terpilih) return;
    if (!confirm(`Hapus tokoh "${terpilih.nama}"?`)) return;
    setMemuat(true);
    setEror(null);
    try {
      const res = await fetch(`/api/admin/tokoh/${terpilih.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEror(data.error ?? "Gagal menghapus tokoh.");
        return;
      }
      window.location.reload();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
      <div>
        <button
          type="button"
          onClick={buatBaru}
          className={cn(
            "mb-2 w-full border-l-4 px-3 py-2.5 text-left font-sans text-sm font-bold transition-colors",
            pilihId === null ? "border-gmnimerah-500 bg-kertas-200 text-hitam-900" : "border-transparent hover:bg-kertas-200",
          )}
        >
          + Tokoh Baru
        </button>
        <nav aria-label="Daftar tokoh" className="flex flex-col gap-1">
          {tokoh.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => muat(t)}
              className={cn(
                "flex items-center gap-2 border-l-4 px-3 py-2 text-left transition-colors",
                t.id === pilihId ? "border-gmnimerah-500 bg-kertas-200" : "border-transparent hover:bg-kertas-200",
              )}
            >
              {t.gambar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.gambar} alt="" className="h-8 w-8 shrink-0 border border-hitam-200 object-cover" />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-hitam-900 font-mono text-[10px] font-bold uppercase text-white">
                  {t.nama.slice(0, 1)}
                </span>
              )}
              <span>
                <span className="block text-sm font-bold text-hitam-900">{t.nama}</span>
                <span className="block font-mono text-[10px] uppercase text-hitam-400">
                  {t.status === "AKTIF" ? "Aktif" : "Arsip"} · #{t.urutan}
                </span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={simpan} className="border-2 border-hitam-900 bg-white p-5">
        <h2 className="font-serif text-xl font-bold text-hitam-900">
          {pilihId ? "Edit Tokoh" : "Tokoh Baru"}
        </h2>
        <p className="mt-1 text-sm text-hitam-500">Profil tokoh Marhaenis tampil di /tokoh.</p>
        {pesan && (
          <p role="status" className="mt-3 border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800">
            {pesan}
          </p>
        )}
        {eror && (
          <p role="alert" className="mt-3 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700">
            {eror}
          </p>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="label-bidang">Nama</span>
            <input type="text" required minLength={2} value={nama} onChange={(e) => gantiNama(e.target.value)} className="input-bidang" placeholder="mis. Ir. Soekarno" />
          </label>
          <label className="block">
            <span className="label-bidang">Julukan</span>
            <input type="text" value={julukan} onChange={(e) => setJulukan(e.target.value)} className="input-bidang" placeholder="mis. Bapak Marhaenisme" />
          </label>
          <label className="block">
            <span className="label-bidang">Slug (URL)</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugDibuat(true);
                setSlug(e.target.value);
              }}
              className="input-bidang"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label-bidang">Lahir</span>
              <input type="number" min={1800} max={2100} value={lahir} onChange={(e) => setLahir(e.target.value)} className="input-bidang" />
            </label>
            <label className="block">
              <span className="label-bidang">Wafat</span>
              <input type="number" min={1800} max={2100} value={wafat} onChange={(e) => setWafat(e.target.value)} className="input-bidang" />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <span className="label-bidang">Foto (opsional)</span>
          {gambar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gambar} alt="Pratinjau foto tokoh" className="mb-2 h-24 w-24 border-2 border-hitam-900 object-cover" />
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={mengunggah}
            onChange={unggah}
            className="w-full max-w-sm border border-hitam-300 bg-white px-2 py-1.5 text-sm file:mr-2 file:border-0 file:bg-hitam-900 file:px-3 file:py-1.5 file:text-white"
          />
          <input
            type="url"
            value={gambar}
            onChange={(e) => setGambar(e.target.value)}
            className="input-bidang mt-2"
            placeholder="...atau tempel URL foto"
          />
        </div>

        <label className="mt-4 block">
          <span className="label-bidang">Biografi</span>
          <textarea
            required
            minLength={10}
            rows={6}
            value={biografi}
            onChange={(e) => setBiografi(e.target.value)}
            className="input-bidang resize-y leading-relaxed"
          />
        </label>

        <label className="mt-4 block">
          <span className="label-bidang">Kutipan Singkat (opsional)</span>
          <textarea
            rows={2}
            value={kutipan}
            onChange={(e) => setKutipan(e.target.value)}
            className="input-bidang resize-y"
          />
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="label-bidang">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-bidang"
            >
              <option value="AKTIF">Aktif (tampil publik)</option>
              <option value="ARSIP">Arsip (disembunyikan)</option>
            </select>
          </label>
          <label className="block">
            <span className="label-bidang">Urutan Tampil</span>
            <input
              type="number"
              min={0}
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              className="input-bidang"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t-2 border-hitam-200 pt-4">
          <button
            type="submit"
            disabled={memuat}
            className="bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
          >
            {memuat ? "Menyimpan..." : pilihId ? "Simpan Perubahan" : "Simpan Tokoh"}
          </button>
          {pilihId && (
            <button
              type="button"
              disabled={memuat}
              onClick={hapus}
              className="border-2 border-gmnimerah-700 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-gmnimerah-700 transition-colors hover:bg-gmnimerah-700 hover:text-white disabled:opacity-50"
            >
              Hapus Tokoh
            </button>
          )}
        </div>
      </form>
    </div>
  );
}