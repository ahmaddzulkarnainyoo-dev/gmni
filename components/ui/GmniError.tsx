"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogoGMNI } from "@/components/brand/LogoGMNI";
import { KickerLabel } from "@/components/ui/KickerLabel";

/**
 * Wajah error-boundary bersama (Sub-Fase 4.2): dipakai tiap route group.
 * Client component sesuai konvensi Next 16 `error.tsx` ({ error, retry }).
 */
export function GmniError({
  area = "publik",
  error,
  retry,
}: {
  area?: "publik" | "dasbor" | "admin" | "auth";
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(`[gmni:${area}]`, error);
  }, [area, error]);

  const kembali =
    area === "admin"
      ? "/admin"
      : area === "dasbor"
        ? "/dasbor"
        : area === "auth"
          ? "/login"
          : "/";

  return (
    <main className="grid flex-1 place-items-center bg-kertas-150 px-4 py-20">
      <div className="max-w-lg border-4 border-hitam-900 bg-white p-8 text-center">
        <LogoGMNI className="mx-auto h-16 w-16" />
        <h1 className="mt-6 font-serif text-4xl font-extrabold text-gmnimerah-500">
          Mesin Cetak Macet
        </h1>
        <KickerLabel warne="hitam" className="mt-4 justify-center">
          Terjadi Gangguan Samping
        </KickerLabel>
        <p className="mt-4 text-hitam-500">
          Redaksi sedang memperbaiki linotipe. Coba muat ulang halaman ini.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-hitam-400">
            Kode: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="bg-gmnimerah-500 px-5 py-2.5 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600"
          >
            Muat Ulang
          </button>
          <Link
            href={kembali}
            className="border-2 border-hitam-900 bg-white px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-hitam-900 hover:bg-kertas-150"
          >
            Kembali
          </Link>
        </div>
      </div>
    </main>
  );
}
