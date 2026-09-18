"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

/**
 * Tombol "Keluar" dengan modal konfirmasi kustom berbahasa Indonesia —
 * menggantikan halaman signout default NextAuth (berbahasa Inggris).
 * Empat varian tampil mengikuti konteks lokasi tombol dipasang.
 */
export function TombolKeluar({
  variant = "link-hari",
  className,
}: {
  variant?: "link-terang" | "link-hari" | "tombol" | "tombol-drawer";
  className?: string;
}) {
  const [buka, setBuka] = useState(false);
  const [proses, setProses] = useState(false);

  // Escape menutup modal + kunci scroll body saat modal terbuka.
  useEffect(() => {
    if (!buka) return;
    const tutupSaatEscape = (e: KeyboardEvent) => {
      if (!proses && e.key === "Escape") setBuka(false);
    };
    document.addEventListener("keydown", tutupSaatEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tutupSaatEscape);
      document.body.style.overflow = "";
    };
  }, [buka, proses]);

  const keluar = () => {
    setProses(true);
    void signOut({ callbackUrl: "/login" });
  };

  const gayaTombol: Record<string, string> = {
    "link-terang":
      "inline-flex min-h-7 items-center rounded-sm border border-white/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-kertas-200 transition-colors hover:border-white hover:text-white",
    "link-hari":
      "border-l-2 border-transparent px-3 py-2 font-sans text-sm font-medium text-gmnimerah-600 transition-colors hover:border-gmnimerah-500 hover:bg-white",
    tombol:
      "rounded-sm bg-red-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-700",
    "tombol-drawer":
      "mt-2 min-h-11 border-l-2 border-transparent px-3 py-2.5 font-sans text-sm font-semibold text-gmnimerah-600 transition-colors hover:border-gmnimerah-500 hover:bg-gmnimerah-50",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className={cn(gayaTombol[variant], className)}
      >
        Keluar
      </button>

      {buka && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={() => !proses && setBuka(false)}
            className="absolute inset-0 bg-hitam-900/70"
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-keluar"
            className="relative w-full max-w-sm border-2 border-hitam-900 bg-kertas-50 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b-2 border-hitam-900 bg-hitam-900 px-4 py-2.5 text-white">
              <p id="judul-keluar" className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                Konfirmasi Keluar
              </p>
              <button
                type="button"
                aria-label="Tutup dialog"
                onClick={() => setBuka(false)}
                disabled={proses}
                className="flex min-h-8 min-w-8 items-center justify-center border border-white/30 font-mono text-sm transition-colors hover:border-gmnimerah-400 hover:text-gmnimerah-400 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-5">
              <h2 className="font-serif text-lg font-bold text-hitam-900">
                Keluar dari Akun
              </h2>
              <p className="mt-1.5 font-sans text-sm text-hitam-700">
                Apakah Anda yakin ingin keluar?
              </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBuka(false)}
                  disabled={proses}
                  className="min-h-10 border border-hitam-900 px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest text-hitam-900 transition-colors hover:bg-hitam-900 hover:text-white disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={keluar}
                  disabled={proses}
                  aria-busy={proses}
                  className="inline-flex min-h-10 items-center gap-2 bg-red-600 px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {proses && (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-3.5 w-3.5 animate-spin"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        className="opacity-90"
                        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                      />
                    </svg>
                  )}
                  {proses ? "Memproses…" : "Ya, Keluar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
