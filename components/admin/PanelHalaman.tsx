"use client";

import { useState } from "react";

type HalamanData = { slug: string; judul: string; konten: string };

/** Editor konten halaman statis (no-code, blueprint 12). */
export function PanelHalaman({ halaman }: { halaman: HalamanData[] }) {
  const [slug, setSlug] = useState(halaman[0]?.slug ?? "");
  const hal = halaman.find((h) => h.slug === slug) ?? halaman[0];
  const [judul, setJudul] = useState(hal?.judul ?? "");
  const [konten, setKonten] = useState(hal?.konten ?? "");
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [eror, setEror] = useState<string | null>(null);
  const [bukaBaru, setBukaBaru] = useState(false);
  const [baruJudul, setBaruJudul] = useState("");
  const [baruSlug, setBaruSlug] = useState("");
  const [baruKonten, setBaruKonten] = useState("");

  async function buatHalaman(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    setPesan(null);
    try {
      const res = await fetch("/api/admin/halaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul: baruJudul, slug: baruSlug, konten: baruKonten }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal membuat halaman.");
        return;
      }
      window.location.reload();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  function gantiSlug(s: string) {
    const h = halaman.find((x) => x.slug === s);
    setSlug(s);
    if (h) {
      setJudul(h.judul);
      setKonten(h.konten);
    }
    setPesan(null);
    setEror(null);
  }

  async function simpan() {
    setMemuat(true);
    setPesan(null);
    setEror(null);
    try {
      const res = await fetch(`/api/admin/halaman/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, konten }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal menyimpan halaman.");
        return;
      }
      setPesan("Perubahan disimpan dan langsung tampil di situs.");
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  if (!hal) {
    return <p className="mt-6 text-sm text-hitam-500">Belum ada halaman statis.</p>;
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setBukaBaru((v) => !v)}
        className="mb-4 bg-hitam-900 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:bg-gmnimerah-600"
      >
        {bukaBaru ? "Tutup Form Halaman Baru" : "+ Halaman Baru"}
      </button>

      {bukaBaru && (
        <form
          onSubmit={buatHalaman}
          className="mb-6 border-2 border-hitam-900 bg-kertas-100 p-4"
        >
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
            Buat Halaman Statis Baru
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
                Judul
              </span>
              <input
                type="text"
                required
                value={baruJudul}
                onChange={(e) => setBaruJudul(e.target.value)}
                className="w-full border-2 border-hitam-900 bg-white px-3 py-2 text-sm text-hitam-900 outline-none focus:border-gmnimerah-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
                Slug (kosongkan = otomatis)
              </span>
              <input
                type="text"
                value={baruSlug}
                onChange={(e) => setBaruSlug(e.target.value)}
                className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-mono text-sm text-hitam-900 outline-none focus:border-gmnimerah-500"
                placeholder="mis. visi-misi"
              />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
              Konten (HTML)
            </span>
            <textarea
              required
              rows={6}
              value={baruKonten}
              onChange={(e) => setBaruKonten(e.target.value)}
              className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-mono text-[13px] text-hitam-900 outline-none focus:border-gmnimerah-500"
            />
          </label>
          <button
            type="submit"
            disabled={memuat}
            className="mt-3 bg-gmnimerah-500 px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-white hover:bg-gmnimerah-600 disabled:opacity-50"
          >
            Simpan Halaman Baru
          </button>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div>
        <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Pilih Halaman
        </p>
        <nav className="flex flex-col gap-1">
          {halaman.map((h) => (
            <button
              key={h.slug}
              type="button"
              onClick={() => gantiSlug(h.slug)}
              className={`border-l-4 px-3 py-2 text-left font-mono text-[12px] transition-colors ${
                h.slug === slug
                  ? "border-gmnimerah-500 bg-kertas-200 text-hitam-900"
                  : "border-transparent text-hitam-600 hover:bg-kertas-200"
              }`}
            >
              /{h.slug}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-2 border-hitam-900 bg-white p-5">
        <label className="block">
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
            Judul
          </span>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-serif text-lg font-bold text-hitam-900 outline-none focus:border-gmnimerah-500"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
            Konten (HTML)
          </span>
          <textarea
            rows={18}
            value={konten}
            onChange={(e) => setKonten(e.target.value)}
            className="w-full resize-y border-2 border-hitam-900 bg-white px-3 py-3 font-mono text-[13px] leading-relaxed text-hitam-900 outline-none focus:border-gmnimerah-500"
          />
        </label>

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

        <button
          type="button"
          onClick={simpan}
          disabled={memuat}
          className="mt-4 bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
        >
          {memuat ? "Menyimpan..." : "Simpan Halaman"}
        </button>
        <p className="mt-2 text-xs text-hitam-400">
          Pratinjau langsung di rute publik, mis. /{hal.slug}.
        </p>
      </div>
      </div>
    </div>
  );
}
