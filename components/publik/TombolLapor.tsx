"use client";

import { useState } from "react";

/** Tombol "Laporkan Komentar" untuk pengunjung (blueprint 8.3). */
export function TombolLapor({ id }: { id: string }) {
  const [sudah, setSudah] = useState(false);
  const [memuat, setMemuat] = useState(false);

  async function lapor() {
    if (sudah) return;
    if (!confirm("Laporkan komentar ini ke redaksi untuk ditinjau?")) return;
    setMemuat(true);
    try {
      const res = await fetch(`/api/komentar/${id}/lapor`, { method: "POST" });
      if (res.ok) setSudah(true);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <button
      type="button"
      onClick={lapor}
      disabled={memuat || sudah}
      className={`font-mono text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50 ${
        sudah ? "text-hitam-400" : "text-gmnimerah-600 hover:text-gmnimerah-700"
      }`}
    >
      {sudah ? "Terlaporkan ✓" : memuat ? "Melaporkan..." : "Laporkan"}
    </button>
  );
}