"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { jalurAktif } from "@/lib/nav";

type NavGrup = { grup: string; item: Array<{ label: string; href: string }> };

/**
 * Navigasi seluler panel admin (drawer hamburger) — di HP sidebar desktop
 * disembunyikan (hidden md:block), sehingga menu ini menjadi satu-satunya
 * pintu navigasi admin di layar kecil.
 */
export function AdminNavMobile({ menu }: { menu: NavGrup[] }) {
  const [buka, setBuka] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={buka ? "Tutup menu admin" : "Buka menu admin"}
        aria-expanded={buka}
        onClick={() => setBuka((v) => !v)}
        className="flex min-h-11 items-center gap-2 border-2 border-hitam-900 bg-white px-4 py-2 font-sans text-xs font-bold uppercase tracking-[0.12em] text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white"
      >
        <span>{buka ? "Tutup" : "Menu Admin"}</span>
        <span aria-hidden className="relative flex h-4 w-5 flex-col justify-between">
          <span className={cn("h-0.5 w-full bg-current transition-transform", buka && "translate-y-[7px] rotate-45")} />
          <span className={cn("h-0.5 w-full bg-current transition-opacity", buka && "opacity-0")} />
          <span className={cn("h-0.5 w-full bg-current transition-transform", buka && "-translate-y-[7px] -rotate-45")} />
        </span>
      </button>

      {buka && (
        <nav aria-label="Menu admin seluler" className="mt-3 border-2 border-hitam-900 bg-white">
          <div className="max-h-[70vh] overflow-y-auto p-3">
            {menu.map((kelompok) => (
              <div key={kelompok.grup} className="mb-3 last:mb-0">
                <p className="mb-1 px-2 font-mono text-[10px] font-bold uppercase tracking-widest text-hitam-500">
                  {kelompok.grup}
                </p>
                <div className="flex flex-col">
                  {kelompok.item.map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      onClick={() => setBuka(false)}
                      aria-current={jalurAktif(pathname, m.href) ? "page" : undefined}
                      className={cn(
                        "border-l-2 px-3 py-2.5 font-sans text-sm transition-colors",
                        jalurAktif(pathname, m.href)
                          ? "border-gmnimerah-500 bg-gmnimerah-50 font-bold text-gmnimerah-700"
                          : "border-transparent font-medium text-hitam-700 hover:border-gmnimerah-500 hover:bg-kertas-100",
                      )}
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
