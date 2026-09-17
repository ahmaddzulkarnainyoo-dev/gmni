"use client";

import { useRef, useState } from "react";
import { BATAS_ISI_PESAN } from "@/lib/dm";

type PengirimRingkas = { id: string; namaLengkap: string; username: string };
type PesanItem = {
  id: string;
  isi: string;
  status: "TERKIRIM" | "DIBACA";
  tanggal: string;
  pengirimId: string;
  pengirim: PengirimRingkas;
};

/** Form kirim pesan: textarea + counter + Enter-kirim (blueprint 8.5). */
export function FormKirimPesan({
  percakapanId,
  userId,
  onTerkirim,
  nonaktif,
}: {
  percakapanId: string | null;
  userId: string;
  onTerkirim: (p: PesanItem) => void;
  nonaktif?: boolean;
}) {
  const [isi, setIsi] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const optimisId = useRef(0);

  async function kirim() {
    const teks = isi.trim();
    if (!teks || memuat || !percakapanId || nonaktif) return;
    if (teks.length > BATAS_ISI_PESAN) {
      setEror(`Pesan maksimal ${BATAS_ISI_PESAN} karakter.`);
      return;
    }
    setMemuat(true);
    setEror(null);
    // Optimistic append agar terasa real-time.
    const tempId = `optimis-${optimisId.current++}`;
    const temp: PesanItem = {
      id: tempId,
      isi: teks,
      status: "TERKIRIM",
      tanggal: new Date().toISOString(),
      pengirimId: userId,
      pengirim: { id: userId, namaLengkap: "Anda", username: "" },
    };
    onTerkirim(temp);
    setIsi("");
    try {
      const res = await fetch("/api/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percakapanId, isi: teks }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        pesan?: PesanItem;
      };
      if (!res.ok || !data.ok || !data.pesan) {
        setEror(data.error ?? "Gagal mengirim pesan.");
        return;
      }
      // Ganti bubble optimis dengan data server (id asli).
      onTerkirim({ ...data.pesan, id: `${data.pesan.id}|ganti:${tempId}` });
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="border-t-2 border-hitam-900 bg-white p-3">
      {eror && (
        <p
          role="alert"
          className="mb-2 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          {eror}
        </p>
      )}
      <div className="flex items-end gap-2">
        <label className="flex-1">
          <span className="sr-only">Tulis pesan</span>
          <textarea
            rows={2}
            value={isi}
            maxLength={BATAS_ISI_PESAN}
            disabled={memuat || nonaktif || !percakapanId}
            onChange={(e) => setIsi(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                kirim();
              }
            }}
            placeholder={
              percakapanId
                ? "Tulis pesan... (Enter kirim, Shift+Enter baris baru)"
                : "Pilih percakapan dulu"
            }
            className="w-full resize-none border-2 border-hitam-900 bg-kertas-100 px-3 py-2 font-sans text-sm text-hitam-900 outline-none placeholder:text-hitam-400 focus:border-gmnimerah-500 disabled:opacity-50"
          />
        </label>
        <button
          type="button"
          onClick={kirim}
          disabled={memuat || nonaktif || !percakapanId || !isi.trim()}
          className="shrink-0 bg-gmnimerah-500 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
        >
          {memuat ? "..." : "Kirim"}
        </button>
      </div>
      <p className="mt-1 text-right font-mono text-[10px] uppercase tracking-widest text-hitam-400">
        {isi.length}/{BATAS_ISI_PESAN}
      </p>
    </div>
  );
}
