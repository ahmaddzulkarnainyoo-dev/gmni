"use client";

import { useRef, useState } from "react";

/**
 * WidgetFotoProfil — unggah / hapus foto profil kader (maks 2 MB,
 * PNG/JPEG/WebP/GIF). Unggah → POST /api/media (jenis=profil) → URL disimpan
 * via PATCH /api/me/pengaturan. Hapus → PATCH fotoProfil=null.
 */
export function WidgetFotoProfil({
  urlAwal,
  namaLengkap,
}: {
  urlAwal: string | null;
  namaLengkap: string;
}) {
  const [url, setUrl] = useState(urlAwal);
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const inputBerkas = useRef<HTMLInputElement>(null);

  function inisial(): string {
    const bagian = namaLengkap.trim().split(/\s+/).slice(0, 2);
    return bagian.map((b) => b.charAt(0).toUpperCase()).join("") || "K";
  }

  function simpanFoto(fotoProfil: string | null, pesan: string) {
    setMemuat(true);
    setEror(null);
    setInfo(null);
    fetch("/api/me/pengaturan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fotoProfil }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; error?: string }
          | null;
        if (!res.ok || !data?.ok) {
          setEror(data?.error ?? "Gagal menyimpan foto profil.");
          return;
        }
        setUrl(fotoProfil);
        setInfo(pesan);
      })
      .catch(() => setEror("Tidak dapat menghubungi server."))
      .finally(() => setMemuat(false));
  }

  async function unggah(berkas: File) {
    if (memuat) return;
    setMemuat(true);
    setEror(null);
    setInfo(null);
    try {
      if (berkas.size > 2 * 1024 * 1024) {
        setEror("Ukuran foto maksimal 2 MB.");
        return;
      }
      const form = new FormData();
      form.append("file", berkas);
      form.append("jenis", "profil");
      const res = await fetch("/api/media", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !data?.url) {
        setEror(data?.error ?? "Gagal mengunggah foto.");
        return;
      }
      setMemuat(false);
      simpanFoto(data.url, "Foto profil diperbarui. Tampil di profil publik, DM, dan leaderboard.");
      return;
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
      if (inputBerkas.current) inputBerkas.current.value = "";
    }
  }

  return (
    <div className="mt-6 border-2 border-hitam-900 bg-white p-5">
      <p className="font-serif text-lg font-bold text-hitam-900">Foto Profil</p>
      <p className="mt-1 text-sm text-hitam-500">
        Tampil di profil publik, pesan langsung (DM), dan papan peringkat.
        PNG/JPEG/WebP/GIF, maks 2 MB.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`Foto profil ${namaLengkap}`}
            className="h-24 w-24 shrink-0 border-2 border-hitam-900 object-cover"
          />
        ) : (
          <span className="grid h-24 w-24 shrink-0 place-items-center border-2 border-hitam-900 bg-kertas-200 font-serif text-2xl font-extrabold text-hitam-700">
            {inisial()}
          </span>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={memuat}
            onClick={() => inputBerkas.current?.click()}
            className="bg-gmnimerah-500 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
          >
            {memuat ? "Memproses..." : url ? "Ganti Foto" : "Unggah Foto"}
          </button>
          {url && (
            <button
              type="button"
              disabled={memuat}
              onClick={() => {
                if (window.confirm("Hapus foto profil Anda?")) {
                  simpanFoto(null, "Foto profil dihapus.");
                }
              }}
              className="border-2 border-gmnimerah-700 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-700 transition-colors hover:bg-gmnimerah-700 hover:text-white disabled:opacity-50"
            >
              Hapus Foto
            </button>
          )}
        </div>

        <input
          ref={inputBerkas}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const berkas = e.target.files?.[0];
            if (berkas) void unggah(berkas);
          }}
        />
      </div>

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