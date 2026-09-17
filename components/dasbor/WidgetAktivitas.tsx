"use client";

import { useEffect, useRef } from "react";

/** Heartbeat kehadiran harian - kirim sekali per hari per browser. */
export function WidgetAktivitas() {
  const terkirim = useRef(false);
  useEffect(() => {
    if (terkirim.current) return;
    terkirim.current = true;
    const kunci = "marhaen-aktivitas-harian";
    const hariIni = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(kunci) === hariIni) return;
    } catch {
      // lanjut - localStorage tidak tersedia
    }
    fetch("/api/kader/aktivitas", { method: "POST" })
      .then(() => {
        try {
          localStorage.setItem(kunci, hariIni);
        } catch {
          // abaikan
        }
      })
      .catch(() => undefined);
  }, []);
  return null;
}
