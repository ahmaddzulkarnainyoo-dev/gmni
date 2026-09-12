"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ItemTicker = { judul: string; slug: string | null };

const INTERVAL = 4500;
const ITEM_MINIMAL = 3;
const PLACEHOLDER: ItemTicker = {
  judul: "Berita baru segera hadir di info Marhaen.",
  slug: null,
};

/**
 * Ticker berita dinamis di bar "TERBARU" — auto-rotate fade-slide
 * tiap 4,5 detik, berhenti saat hover/fokus. Setiap judul artikel
 * terbit terbaru tertaut ke /artikel/[slug]. Jika terbit < 3,
 * slot dilengkapi placeholder rapi (bukan teks mentah).
 */
export function TickerBerita({
  berita,
}: {
  berita: Array<{ judul: string; slug: string }>;
}) {
  const item: ItemTicker[] = [...berita.slice(0, ITEM_MINIMAL)];
  while (item.length < ITEM_MINIMAL) item.push(PLACEHOLDER);

  const [indeks, setIndeks] = useState(0);
  const [jeda, setJeda] = useState(false);

  useEffect(() => {
    if (jeda) return;
    const id = setInterval(() => {
      setIndeks((v) => (v + 1) % item.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [jeda, item.length]);

  return (
    <div
      aria-live="polite"
      onMouseEnter={() => setJeda(true)}
      onMouseLeave={() => setJeda(false)}
      className="relative h-5 min-w-0 flex-1 overflow-hidden font-mono text-[12px] uppercase tracking-wide"
    >
      {item.map((b, i) => (
        <div
          key={b.slug ?? `placeholder-${i}`}
          className={cn(
            "absolute inset-0 flex items-center transition-all duration-700 ease-in-out",
            i === indeks
              ? "translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-3 opacity-0",
          )}
        >
          {b.slug ? (
            <Link
              href={`/artikel/${b.slug}`}
              onFocus={() => setJeda(true)}
              onBlur={() => setJeda(false)}
              className="block truncate text-white hover:underline hover:underline-offset-4"
            >
              {b.judul}
            </Link>
          ) : (
            <span className="block truncate text-white/80">{b.judul}</span>
          )}
        </div>
      ))}
    </div>
  );
}
