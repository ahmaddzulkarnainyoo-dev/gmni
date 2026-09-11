"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Tombol mengajukan draf ke redaksi (DRAFT / DIMINTA_REVISI). */
export function TombolAjukan({ id }: { id: string }) {
  const router = useRouter();
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);

  async function ajukan() {
    setMemuat(true);
    setEror(null);
    try {
      const res = await fetch(`/api/artikel/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajukan: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEror(data.error ?? "Gagal mengajukan artikel.");
        return;
      }
      router.refresh();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={ajukan}
        disabled={memuat}
        className="border-2 border-hitam-900 bg-kertas-100 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-gmnimerah-500 hover:text-white disabled:opacity-50"
      >
        {memuat ? "Mengajukan..." : "Ajukan ke Redaksi"}
      </button>
      {eror && <span className="text-xs font-semibold text-gmnimerah-700">{eror}</span>}
    </span>
  );
}