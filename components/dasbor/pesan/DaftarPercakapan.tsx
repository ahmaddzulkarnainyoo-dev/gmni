"use client";

import { useEffect, useState } from "react";

type KaderItem = {
  id: string;
  namaLengkap: string;
  username: string;
  fotoProfil: string | null;
};

type RoomItem = {
  id: string;
  pesanTerakhirAt: string | null;
  lawan: {
    id: string;
    namaLengkap: string;
    username: string;
    fotoProfil: string | null;
    statusAkun: string;
  } | null;
  pesanTerakhir: { isi: string; tanggal: string; pengirimId: string } | null;
  belumDibaca: number;
};

function potong(teks: string, batas = 60): string {
  const t = teks.replace(/\s+/g, " ").trim();
  return t.length > batas ? `${t.slice(0, batas)}…` : t;
}

/** Panel kiri: daftar percakapan + pencarian kader baru (blueprint 8.5). */
export function DaftarPercakapan({
  room,
  aktifId,
  userId,
  onPilih,
  onMulaiBaru,
  tersembunyiMobile,
}: {
  room: RoomItem[];
  aktifId: string | null;
  userId: string;
  onPilih: (id: string) => void;
  onMulaiBaru: (kader: KaderItem) => void;
  tersembunyiMobile: boolean;
}) {
  const [cari, setCari] = useState("");
  const [hasil, setHasil] = useState<KaderItem[]>([]);
  const [mencari, setMencari] = useState(false);

  useEffect(() => {
    const q = cari.trim();
    if (q.length < 2) {
      setHasil([]);
      return;
    }
    const t = setTimeout(async () => {
      setMencari(true);
      try {
        const res = await fetch(
          `/api/pesan/cari?q=${encodeURIComponent(q)}`,
        );
        const data = (await res.json()) as { kader?: KaderItem[] };
        setHasil(res.ok ? (data.kader ?? []) : []);
      } catch {
        setHasil([]);
      } finally {
        setMencari(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [cari]);

  return (
    <aside
      className={`flex w-full flex-col border-2 border-hitam-900 bg-white md:w-72 md:shrink-0 ${
        tersembunyiMobile ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="border-b-2 border-hitam-900 p-3">
        <label className="block">
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
            Cari kader / mulai baru
          </span>
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Ketik nama atau @username…"
            className="w-full border-2 border-hitam-900 bg-kertas-100 px-3 py-2 font-sans text-sm text-hitam-900 outline-none placeholder:text-hitam-400 focus:border-gmnimerah-500"
          />
        </label>
        {cari.trim().length >= 2 && (
          <ul className="mt-2 max-h-44 divide-y divide-hitam-100 overflow-y-auto border-2 border-hitam-900">
            {mencari ? (
              <li className="px-3 py-2 text-sm text-hitam-400">Mencari…</li>
            ) : hasil.length === 0 ? (
              <li className="px-3 py-2 text-sm text-hitam-400">
                Tidak ada kader yang cocok (atau profilnya tersembunyi).
              </li>
            ) : (
              hasil.map((k) => (
                <li key={k.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onMulaiBaru(k);
                      setCari("");
                      setHasil([]);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-kertas-100"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center border border-hitam-900 bg-hitam-900 font-serif text-sm font-bold text-white/80">
                      {k.namaLengkap.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-hitam-900">
                        {k.namaLengkap}
                      </span>
                      <span className="block truncate font-mono text-[11px] uppercase tracking-widest text-hitam-400">
                        @{k.username}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <ul className="max-h-[60vh] flex-1 divide-y divide-hitam-100 overflow-y-auto md:max-h-none">
        {room.length === 0 ? (
          <li className="p-5 text-center text-sm text-hitam-400">
            Belum ada percakapan. Cari kader di atas untuk mulai mengobrol.
          </li>
        ) : (
          room.map((r) => {
            const aktif = r.id === aktifId;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onPilih(r.id)}
                  className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
                    aktif
                      ? "bg-hitam-900 text-white"
                      : "bg-white hover:bg-kertas-100"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-hitam-900 bg-hitam-900 font-serif text-lg font-extrabold text-white/80">
                    {r.lawan?.fotoProfil ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.lawan.fotoProfil}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (r.lawan?.namaLengkap ?? "?").slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-bold ${
                          aktif ? "text-white" : "text-hitam-900"
                        }`}
                      >
                        {r.lawan?.namaLengkap ?? "Kader"}
                      </span>
                      {r.belumDibaca > 0 && (
                        <span className="shrink-0 bg-gmnimerah-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                          {r.belumDibaca}
                        </span>
                      )}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-xs ${
                        aktif ? "text-white/70" : "text-hitam-500"
                      }`}
                    >
                      {r.pesanTerakhir
                        ? `${r.pesanTerakhir.pengirimId === userId ? "Anda: " : ""}${potong(r.pesanTerakhir.isi)}`
                        : "Belum ada pesan"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
