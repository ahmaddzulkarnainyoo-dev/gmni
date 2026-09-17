"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FormKirimPesan } from "./FormKirimPesan";

type PesanItem = {
  id: string;
  isi: string;
  status: "TERKIRIM" | "DIBACA";
  tanggal: string;
  pengirimId: string;
  pengirim: { id: string; namaLengkap: string; username: string };
};

type LawanBicara = {
  id: string;
  namaLengkap: string;
  username: string;
  fotoProfil: string | null;
  statusAkun: string;
} | null;

function fmtJam(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Panel kanan: header penerima + bubble chat + resi dibaca + input.
 * onKembali dipakai di mobile untuk kembali ke daftar.
 */
export function JendelaChat({
  percakapanId,
  lawan,
  pesan,
  userId,
  memuat,
  onTerkirim,
  onKembali,
}: {
  percakapanId: string | null;
  lawan: LawanBicara;
  pesan: PesanItem[];
  userId: string;
  memuat: boolean;
  onTerkirim: (p: PesanItem) => void;
  onKembali: () => void;
}) {
  const bawahRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [pesan.length, percakapanId]);

  if (!percakapanId) {
    return (
      <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center border-2 border-hitam-900 bg-white p-8 text-center">
        <p className="font-serif text-xl font-bold text-hitam-900">
          Pilih percakapan
        </p>
        <p className="mt-2 max-w-sm text-sm text-hitam-500">
          Pilih room di panel kiri, atau cari kader untuk memulai obrolan baru.
        </p>
      </div>
    );
  }

  return (
    <section className="flex min-h-[420px] flex-1 flex-col border-2 border-hitam-900 bg-white">
      <header className="flex items-center gap-3 border-b-2 border-hitam-900 bg-kertas-100 px-4 py-3">
        <button
          type="button"
          onClick={onKembali}
          aria-label="Kembali ke daftar percakapan"
          className="border-2 border-hitam-900 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-900 md:hidden"
        >
          &larr;
        </button>
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-hitam-900 bg-hitam-900 font-serif text-lg font-extrabold text-white/80">
          {lawan?.fotoProfil ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lawan.fotoProfil}
              alt={`Foto ${lawan.namaLengkap}`}
              className="h-full w-full object-cover"
            />
          ) : (
            (lawan?.namaLengkap ?? "?").slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-base font-bold text-hitam-900">
            {lawan?.namaLengkap ?? "Kader"}
          </p>
          {lawan && (
            <Link
              href={`/profil/${lawan.username}`}
              className="font-mono text-[11px] uppercase tracking-widest text-gmnimerah-600 hover:text-gmnimerah-700"
            >
              @{lawan.username} &middot; Lihat profil
            </Link>
          )}
        </div>
      </header>

      <div className="flex max-h-[52vh] min-h-[280px] flex-1 flex-col gap-2 overflow-y-auto bg-kertas-100 p-4">
        {memuat ? (
          <p className="py-8 text-center text-sm text-hitam-400">
            Memuat riwayat...
          </p>
        ) : pesan.length === 0 ? (
          <p className="py-8 text-center text-sm text-hitam-400">
            Belum ada pesan. Sapa kader ini dengan santun.
          </p>
        ) : (
          pesan.map((p) => {
            const milikku = p.pengirimId === userId;
            return (
              <div
                key={p.id}
                className={`flex ${milikku ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] border-2 px-3 py-2 ${
                    milikku
                      ? "border-hitam-900 bg-hitam-900 text-white"
                      : "border-hitam-900 bg-white text-hitam-900"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {p.isi}
                  </p>
                  <p
                    className={`mt-1 text-right font-mono text-[10px] uppercase tracking-widest ${
                      milikku ? "text-white/60" : "text-hitam-400"
                    }`}
                  >
                    {fmtJam(p.tanggal)}
                    {milikku && (
                      <span className="ml-1">
                        {p.status === "DIBACA" ? "- Dibaca" : "- Terkirim"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bawahRef} />
      </div>

      <FormKirimPesan
        percakapanId={percakapanId}
        userId={userId}
        onTerkirim={onTerkirim}
      />
    </section>
  );
}
