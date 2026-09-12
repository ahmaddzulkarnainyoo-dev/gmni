"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { jalurAktif } from "@/lib/nav";

type NavItem = { label: string; href: string };
type KatItem = { label: string; slug: string };

/** Navigasi mobile (hamburger/drawer) — cegah menu melebar di HP (Fase 3). */
export function MobileNav({
  navUtama,
  kategoriBerita,
  user,
}: {
  navUtama: NavItem[];
  kategoriBerita: KatItem[];
  user: { masuk: boolean; roleNama?: string | null };
}) {
  const [buka, setBuka] = useState(false);
  const pathname = usePathname();

  const taut = (cls: string, ekstra = "") =>
    cn("block px-3 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider transition-colors", cls, ekstra);

  return (
    <>
      <button
        type="button"
        aria-label={buka ? "Tutup menu" : "Buka menu"}
        aria-expanded={buka}
        onClick={() => setBuka((v) => !v)}
        className="ml-auto flex items-center gap-2 px-2 py-4 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 hover:text-gmnimerah-600 lg:hidden"
      >
        <span>{buka ? "Tutup" : "Menu"}</span>
        <span aria-hidden className="relative flex h-4 w-5 flex-col justify-between">
          <span className={cn("h-0.5 w-full bg-hitam-900 transition-transform", buka && "translate-y-[7px] rotate-45")} />
          <span className={cn("h-0.5 w-full bg-hitam-900 transition-opacity", buka && "opacity-0")} />
          <span className={cn("h-0.5 w-full bg-hitam-900 transition-transform", buka && "-translate-y-[7px] -rotate-45")} />
        </span>
      </button>

      {buka && (
        <nav aria-label="Menu seluler" className="w-full border-t-2 border-hitam-900 bg-kertas-100 lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <ul className="grid gap-1">
              {navUtama.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setBuka(false)}
                    aria-current={
                      jalurAktif(pathname, item.href) ? "page" : undefined
                    }
                    className={taut(
                      jalurAktif(pathname, item.href)
                        ? "bg-gmnimerah-500 text-white"
                        : "text-hitam-900 hover:bg-gmnimerah-500 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.href === "/berita" && (
                    <ul className="ml-3 mt-1 grid gap-0.5 border-l-2 border-hitam-200 pl-3">
                      {kategoriBerita.map((k) => (
                        <li key={k.slug}>
                          <Link
                            href={`/berita/${k.slug}`}
                            onClick={() => setBuka(false)}
                            aria-current={
                              pathname === `/berita/${k.slug}`
                                ? "page"
                                : undefined
                            }
                            className={cn(
                              "block px-2 py-1.5 text-[13px] hover:text-gmnimerah-600",
                              pathname === `/berita/${k.slug}`
                                ? "bg-gmnimerah-100 font-bold text-gmnimerah-600"
                                : "text-hitam-600",
                            )}
                          >
                            {k.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/cari"
                  onClick={() => setBuka(false)}
                  aria-current={
                    jalurAktif(pathname, "/cari") ? "page" : undefined
                  }
                  className={taut(
                    jalurAktif(pathname, "/cari")
                      ? "bg-gmnimerah-500 text-white"
                      : "text-hitam-900 hover:bg-gmnimerah-500 hover:text-white",
                  )}
                >
                  Cari
                </Link>
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-hitam-200 pt-4">
              {user.masuk ? (
                <>
                  <Link href="/dasbor" onClick={() => setBuka(false)} className="border border-hitam-900 px-3 py-1.5 text-sm font-semibold text-hitam-900 hover:bg-hitam-900 hover:text-white">
                    Dasbor
                  </Link>
                  {user.roleNama && (
                    <Link href="/admin" onClick={() => setBuka(false)} className="border border-gmnimerah-500 px-3 py-1.5 text-sm font-semibold text-gmnimerah-600 hover:bg-gmnimerah-500 hover:text-white">
                      Admin
                    </Link>
                  )}
                  <Link href="/api/auth/signout?callbackUrl=/login" className="bg-gmnimerah-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gmnimerah-600">
                    Keluar
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setBuka(false)} className="border border-hitam-900 px-3 py-1.5 text-sm font-semibold text-hitam-900 hover:bg-hitam-900 hover:text-white">
                    Masuk
                  </Link>
                  <Link href="/daftar" onClick={() => setBuka(false)} className="bg-gmnimerah-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gmnimerah-600">
                    Registrasi Kader
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}