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
 * tiap 4,5 detik, berhenti saat hover/fokus. Judul memakai sans-serif
 * normal (bukan kapital rapat) agar terbaca seperti lead koran, dan
 * tertaut ke /artikel/[slug]. Jika artikel terbit < 3, slot dilengkapi
 * placeholder rapi (bukan teks mentah).
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
      className="relative h-6 min-w-0 flex-1 overflow-hidden font-sans text-[13px] font-normal normal-case tracking-normal sm:text-sm"
    >
      {item.map((b, i) => {
        const tampil = i === indeks;
        return (
          <div
            key={b.slug ?? `placeholder-${i}`}
            aria-hidden={!tampil}
            className={cn(
              "absolute inset-0 flex items-center transition-all duration-700 ease-in-out",
              tampil
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-3 opacity-0",
            )}
          >
            {b.slug ? (
              <Link
                href={`/artikel/${b.slug}`}
                tabIndex={tampil ? undefined : -1}
                onFocus={() => setJeda(true)}
                onBlur={() => setJeda(false)}
                className="block truncate text-hitam-800 transition-colors hover:text-red-600 hover:underline hover:underline-offset-4"
              >
                {b.judul}
              </Link>
            ) : (
              <span className="block truncate text-hitam-500">{b.judul}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
