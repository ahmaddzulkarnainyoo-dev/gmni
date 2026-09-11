"use client";

import { useMemo, useState } from "react";
import type { StatusArtikel } from "@prisma/client";

type BarisArtikel = {
  id: string;
  judul: string;
  slug: string;
  status: StatusArtikel;
  visibilitasPenulis: "ASLI" | "SAMARAN" | "REDAKSI";
  namaTampilanKustom: string | null;
  kategoriNama: string;
  penulisNama: string;
};

/** Panel antrian redaksi: tinjau, terbitkan, minta revisi, tolak. */
export function PanelArtikel({ artikel }: { artikel: BarisArtikel[] }) {
  const [memuat, setMemuat] = useState<string | null>(null);
  const [catatan, setCatatan] = useState<Record<string, string | null>>({});
  const [eror, setEror] = useState<Record<string, string>>({});

  const barisTampil = useMemo(
    () => artikel.filter((a) => a.status !== "DIARSIPKAN"),
    [artikel],
  );

  async function jalankan(a: BarisArtikel, aksi: string, catatanWajib?: string) {
    if (catatanWajib !== undefined && (!catatanWajib || catatanWajib.length < 3)) {
      setEror((e) => ({ ...e, [a.id]: "Tulis catatan/revisi minimal 3 karakter." }));
      return;
    }
    setMemuat(a.id);
    setEror((e) => ({ ...e, [a.id]: "" }));
    try {
      const res = await fetch(`/api/artikel/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aksi, catatanRevisi: catatanWajib ?? undefined }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEror((e) => ({ ...e, [a.id]: data.error ?? "Gagal memproses artikel." }));
        return;
      }
      setCatatan((c) => ({ ...c, [a.id]: null }));
      window.location.reload();
    } catch {
      setEror((e) => ({ ...e, [a.id]: "Tidak dapat menghubungi server." }));
    } finally {
      setMemuat(null);
    }
  }

  if (barisTampil.length === 0) {
    return (
      <div className="mt-6 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
        <p className="font-serif text-xl font-bold text-hitam-900">
          Antrian redaksi kosong.
        </p>
        <p className="mt-2 text-sm text-hitam-500">
          Tidak ada tulisan yang sedang menunggu atau ditinjau.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {barisTampil.map((a) => {
        const aktif = ["DIAJUKAN", "SEDANG_DITINJAU"].includes(a.status);
        const catatanBuka = catatan[a.id] !== undefined;
        return (
          <li key={a.id} className="border border-hitam-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-hitam-900 bg-kertas-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-hitam-700">
                    {a.status}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-hitam-400">
                    {a.kategoriNama}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-gmnimerah-600">
                    {a.visibilitasPenulis === "SAMARAN"
                      ? a.namaTampilanKustom
                      : a.visibilitasPenulis === "REDAKSI"
                        ? "Redaksi"
                        : a.penulisNama}
                  </span>
                </div>
                <a
                  href={a.status === "TERBIT" ? `/artikel/${a.slug}` : "#"}
                  className="mt-2 block font-serif text-lg font-bold leading-snug text-hitam-900 hover:text-gmnimerah-600"
                >
                  {a.judul}
                </a>
                {eror[a.id] && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-gmnimerah-700">
                    {eror[a.id]}
                  </p>
                )}
              </div>

              {aktif && (
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {a.status === "DIAJUKAN" && (
                      <button
                        type="button"
                        disabled={memuat === a.id}
                        onClick={() => jalankan(a, "TINJAU")}
                        className="border-2 border-hitam-900 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white disabled:opacity-50"
                      >
                        Tinjau
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={memuat === a.id}
                      onClick={() => jalankan(a, "TERBIT")}
                      className="bg-gmnimerah-500 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
                    >
                      Terbitkan
                    </button>
                    <button
                      type="button"
                      disabled={memuat === a.id}
                      onClick={() => setCatatan((c) => ({ ...c, [a.id]: "" }))}
                      className="border-2 border-hitam-900 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-kertas-200 disabled:opacity-50"
                    >
                      Revisi
                    </button>
                    <button
                      type="button"
                      disabled={memuat === a.id}
                      onClick={() => setCatatan((c) => ({ ...c, [a.id]: "" }))}
                      className="border-2 border-gmnimerah-700 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-700 transition-colors hover:bg-gmnimerah-700 hover:text-white disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </div>

                  {catatanBuka && (
                      <div className="flex w-72 max-w-full flex-col gap-1.5">
                        <textarea
                          rows={2}
                          value={catatan[a.id] ?? ""}
                          onChange={(ev) => setCatatan((c) => ({ ...c, [a.id]: ev.target.value }))}
                          className="w-full border-2 border-hitam-900 bg-white px-2 py-1 text-sm text-hitam-900 outline-none focus:border-gmnimerah-500"
                          placeholder="Catatan untuk penulis (wajib)..."
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={memuat === a.id}
                            onClick={() => jalankan(a, "REVISI", catatan[a.id] ?? "")}
                            className="bg-hitam-900 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
                          >
                            Kirim Revisi
                          </button>
                          <button
                            type="button"
                            disabled={memuat === a.id}
                            onClick={() => jalankan(a, "TOLAK", catatan[a.id] ?? "")}
                            className="bg-gmnimerah-700 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
                          >
                            Tolak Artikel
                          </button>
                          <button
                            type="button"
                            onClick={() => setCatatan((c) => ({ ...c, [a.id]: null }))}
                            className="border border-hitam-300 px-2 py-1 font-mono text-[11px] text-hitam-500"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}