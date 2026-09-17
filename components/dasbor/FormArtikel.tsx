"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { htmlKeMd, mdKeHtml } from "@/lib/markdown";
import type { StatusArtikel, VisibilitasPenulis } from "@prisma/client";

/**
 * Pembungkus aman konversi Markdown: bila parser melempar pada input
 * tertentu, kembalikan fallback (bukan crash render / boundary global).
 */
function mdKeHtmlAman(md: string): string {
  try {
    return mdKeHtml(md);
  } catch {
    return md;
  }
}

function htmlKeMdAman(html: string): string {
  try {
    return htmlKeMd(html);
  } catch {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
}

type KategoriOpsi = { id: string; nama: string; slug: string; isTetap: boolean };
type TagOpsi = { id: string; nama: string; slug: string };

type DataArtikelEdit = {
  id: string;
  judul: string;
  ringkasan: string | null;
  konten: string;
  kategoriId: string;
  visibilitasPenulis: VisibilitasPenulis;
  namaTampilanKustom: string | null;
  status: StatusArtikel;
  tagIds: string[];
};

const PILIHAN_VISIBILITAS: Array<{ nilai: VisibilitasPenulis; label: string; bantu: string }> = [
  {
    nilai: "ASLI",
    label: "Nama Asli",
    bantu: "Nama terhubung ke profil kader Anda.",
  },
  {
    nilai: "SAMARAN",
    label: "Nama Samaran",
    bantu: "Identitas dilindungi dan dikecualikan dari leaderboard.",
  },
  {
    nilai: "REDAKSI",
    label: "Atas Nama Redaksi",
    bantu: "Ditulis atas nama redaksi info Marhaen.",
  },
];

/** Editor artikel Markdown + pratinjau (mode buat & mode edit). */
export function FormArtikel({
  kategori,
  tags,
  buat = true,
  artikel,
}: {
  kategori: KategoriOpsi[];
  tags: TagOpsi[];
  buat?: boolean;
  artikel?: DataArtikelEdit;
}) {
  const router = useRouter();
  const [judul, setJudul] = useState(artikel?.judul ?? "");
  const [ringkasan, setRingkasan] = useState(artikel?.ringkasan ?? "");
  const [konten, setKonten] = useState(() => (artikel ? htmlKeMdAman(artikel.konten) : ""));
  const [kategoriId, setKategoriId] = useState(artikel?.kategoriId ?? kategori[0]?.id ?? "");
  const [tagIds, setTagIds] = useState<string[]>(artikel?.tagIds ?? []);
  const [visibilitas, setVisibilitas] = useState<VisibilitasPenulis>(
    artikel?.visibilitasPenulis ?? "ASLI",
  );
  const [namaSamaran, setNamaSamaran] = useState(artikel?.namaTampilanKustom ?? "");
  const [ajukan, setAjukan] = useState(false);
  const [pratinjau, setPratinjau] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const pratinjauHtml = useMemo(() => mdKeHtmlAman(konten), [konten]);

  function sisip(teks: string) {
    setKonten((k) => (k.length === 0 ? teks : `${k}\n\n${teks}`));
    setPratinjau(false);
  }

  function toggleTag(id: string) {
    setTagIds((ts) => (ts.includes(id) ? ts.filter((t) => t !== id) : [...ts, id]));
  }

  async function simpan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    setInfo(null);

    const payload = {
      judul,
      ringkasan,
      konten,
      kategoriId,
      tagIds,
      visibilitasPenulis: visibilitas,
      namaTampilanKustom: visibilitas === "SAMARAN" ? namaSamaran : null,
      ...(buat ? { ajukan } : {}),
    };

    try {
      const url = buat ? "/api/artikel" : `/api/artikel/${artikel!.id}`;
      const res = await fetch(url, {
        method: buat ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: { ok?: boolean; error?: string; status?: string } = {};
      try {
        data = (await res.json()) as { ok?: boolean; error?: string; status?: string };
      } catch {
        const teksMentah = (await res.text().catch(() => "")) || "";
        data = {
          error: teksMentah.startsWith("{")
            ? "Respons server tidak valid."
            : `Server tidak membalas JSON (kode ${res.status}). Silakan coba lagi.`
        };
      }
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal menyimpan artikel.");
        setMemuat(false);
        return;
      }
      if (buat) {
        router.push("/dasbor/tulisan-saya");
        router.refresh();
        return;
      }
      setInfo(
        ajukan
          ? "Artikel dikirim ulang ke redaksi."
          : `Tersimpan (status: ${data.status ?? "draft"}).`,
      );
      setAjukan(false);
      setMemuat(false);
      router.refresh();
    } catch {
      setEror("Tidak dapat menghubungi server.");
      setMemuat(false);
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-hitam-900 pb-3">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
            {buat ? "Tulis Artikel" : "Edit Artikel"}
          </h1>
          <p className="mt-1 text-sm text-hitam-500">
            Tulis dalam Markdown sederhana, pratinjau sebelum mengajukan ke redaksi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPratinjau((p) => !p)}
          className="border-2 border-hitam-900 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white"
        >
          {pratinjau ? "Kembali Menulis" : "Pratinjau"}
        </button>
      </div>

      {eror && (
        <p role="alert" className="border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700">
          {eror}
        </p>
      )}
      {info && (
        <p role="status" className="border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800">
          {info}
        </p>
      )}

      <label className="block">
        <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Judul
        </span>
        <input
          type="text"
          required
          minLength={8}
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className="w-full border-2 border-hitam-900 bg-white px-3 py-2.5 font-serif text-xl font-bold text-hitam-900 outline-none transition-colors focus:border-gmnimerah-500"
          placeholder="Judul yang tegas, mis. Merawat Nalar Marhaenis di Kampus"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Ringkasan (opsional, tampil di kartu berita)
        </span>
        <textarea
          rows={2}
          value={ringkasan}
          onChange={(e) => setRingkasan(e.target.value)}
          className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none transition-colors focus:border-gmnimerah-500"
          maxLength={300}
          placeholder="Satu-dua kalimat yang memancing pembaca."
        />
      </label>

      {!pratinjau && (
        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
              Isi Tulisan (Markdown)
            </span>
            <div className="flex gap-1">
              {["## ", "- ", "**teks**", "> "].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => sisip(t)}
                  className="border border-hitam-300 bg-kertas-100 px-2 py-1 font-mono text-[11px] text-hitam-700 transition-colors hover:border-gmnimerah-500 hover:bg-gmnimerah-50"
                >
                  {t.trim() || "..."}
                </button>
              ))}
            </div>
          </div>
          <textarea
            required
            minLength={40}
            rows={18}
            value={konten}
            onChange={(e) => setKonten(e.target.value)}
            className="w-full resize-y border-2 border-hitam-900 bg-white px-3 py-3 font-mono text-[13px] leading-relaxed text-hitam-900 outline-none transition-colors focus:border-gmnimerah-500"
            placeholder={"Gunakan Markdown:\n## Judul Bagian\n\nParagraf pembuka...\n\n- poin pertama\n- poin kedua\n\n**teks tebal** atau _teks miring_"}
          />
        </div>
      )}

      {pratinjau && (
        <div className="border-4 border-hitam-900 bg-white p-5 md:p-8">
          <h2 className="font-serif text-3xl font-extrabold leading-tight text-hitam-900">
            {judul || "(tanpa judul)"}
          </h2>
          <div
            className="konten-artikel mt-6"
            dangerouslySetInnerHTML={{ __html: pratinjauHtml }}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
            Kategori
          </span>
          <select
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none focus:border-gmnimerah-500"
          >
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.isTetap ? `${k.nama} (tetap)` : k.nama}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
            Tag (maks. 5)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`border px-2 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                  tagIds.includes(t.id)
                    ? "border-gmnimerah-500 bg-gmnimerah-500 text-white"
                    : "border-hitam-300 bg-kertas-100 text-hitam-600 hover:border-hitam-900"
                }`}
              >
                {t.nama}
              </button>
            ))}
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Visibilitas Penulis
        </legend>
        <div className="grid gap-3">
          {PILIHAN_VISIBILITAS.map((p) => (
            <label
              key={p.nilai}
              className={`flex cursor-pointer items-start gap-3 border-2 p-3 transition-colors ${
                visibilitas === p.nilai
                  ? "border-gmnimerah-500 bg-gmnimerah-50"
                  : "border-hitam-200 bg-white hover:border-hitam-900"
              }`}
            >
              <input
                type="radio"
                name="visibilitas"
                value={p.nilai}
                checked={visibilitas === p.nilai}
                onChange={() => setVisibilitas(p.nilai)}
                className="mt-1 accent-gmnimerah-500"
              />
              <span>
                <span className="block font-sans text-sm font-bold text-hitam-900">
                  {p.label}
                </span>
                <span className="block text-xs text-hitam-500">{p.bantu}</span>
              </span>
            </label>
          ))}
        </div>
        {visibilitas === "SAMARAN" && (
          <label className="mt-3 block">
            <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
              Nama Samaran
            </span>
            <input
              type="text"
              required
              value={namaSamaran}
              onChange={(e) => setNamaSamaran(e.target.value)}
              className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none focus:border-gmnimerah-500"
              placeholder="mis. Kader Cakrabirawa (tidak tertaut ke profil)"
            />
          </label>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t-2 border-hitam-900 pt-4">
        {buat ? (
          <>
            <button
              type="submit"
              disabled={memuat}
              className="bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
            >
              {memuat ? "Menyimpan..." : "Simpan sebagai Draf"}
            </button>
            <button
              type="submit"
              disabled={memuat}
              onClick={() => setAjukan(true)}
              className="border-2 border-hitam-900 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white disabled:opacity-50"
            >
              {memuat ? "Mengajukan..." : "Simpan & Ajukan ke Redaksi"}
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              disabled={memuat}
              className="bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
            >
              {memuat ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="submit"
              disabled={memuat}
              onClick={() => setAjukan(true)}
              className="border-2 border-hitam-900 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white disabled:opacity-50"
            >
              {memuat ? "Mengajukan..." : "Simpan & Ajukan Ulang ke Redaksi"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
