"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DaftarPercakapan } from "./DaftarPercakapan";
import { JendelaChat } from "./JendelaChat";

type PesanItem = {
  id: string;
  isi: string;
  status: "TERKIRIM" | "DIBACA";
  tanggal: string;
  pengirimId: string;
  pengirim: { id: string; namaLengkap: string; username: string };
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

// Polling ringan ala plan 3.1: chat aktif 5 dtk, daftar 15 dtk, hanya saat
// tab terlihat (hemat kuota serverless).
const INTERVAL_CHAT_MS = 5000;
const INTERVAL_DAFTAR_MS = 15000;

function gabungPesan(lama: PesanItem[], tambahan: PesanItem[]): PesanItem[] {
  const ganti = new Map<string, PesanItem>();
  const baru: PesanItem[] = [];
  for (const p of tambahan) {
    const [idAsli, penanda] = p.id.split("|ganti:");
    if (penanda) ganti.set(penanda, { ...p, id: idAsli });
    else baru.push(p);
  }
  const hasil = lama.map((p) => ganti.get(p.id) ?? p);
  const ada = new Set(hasil.map((p) => p.id));
  for (const p of baru) {
    if (!ada.has(p.id)) {
      hasil.push(p);
      ada.add(p.id);
    }
  }
  return hasil
    .sort((a, b) => +new Date(a.tanggal) - +new Date(b.tanggal))
    .slice(-200);
}


/** Orkestrasi ruang obrolan: daftar + chat + polling (opsi A plan 3.1). */
export function RuangObrolan({
  userId,
  awal,
  denganUsername,
}: {
  userId: string;
  awal: RoomItem[];
  denganUsername?: string;
}) {
  const [room, setRoom] = useState<RoomItem[]>(awal);
  const [aktifId, setAktifId] = useState<string | null>(awal[0]?.id ?? null);
  const [pesan, setPesan] = useState<PesanItem[]>([]);
  const [memuatChat, setMemuatChat] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const aktifRef = useRef<string | null>(null);
  aktifRef.current = aktifId;

  const muatDaftar = useCallback(async () => {
    try {
      const res = await fetch("/api/pesan/percakapan");
      if (!res.ok) return;
      const data = (await res.json()) as { percakapan?: RoomItem[] };
      if (data.percakapan) setRoom(data.percakapan);
    } catch {
      /* abaikan — polling berikutnya mencoba lagi */
    }
  }, []);

  const muatRiwayat = useCallback(async (id: string, polling = false) => {
    if (!polling) {
      setMemuatChat(true);
      cursorRef.current = null;
    }
    try {
      const url =
        polling && cursorRef.current
          ? `/api/pesan/${id}?setelah=${encodeURIComponent(cursorRef.current)}`
          : `/api/pesan/${id}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as { pesan?: PesanItem[] };
      const daftar = data.pesan ?? [];
      if (aktifRef.current !== id) return;
      setPesan((lama) => gabungPesan(polling ? lama : [], daftar));
      const terakhir = [...daftar].pop();
      if (terakhir) cursorRef.current = terakhir.tanggal;
      else if (!polling) setPesan([]);
    } catch {
      /* abaikan */
    } finally {
      if (!polling) setMemuatChat(false);
    }
  }, []);

  useEffect(() => {
    if (aktifId && !aktifId.startsWith("baru:")) muatRiwayat(aktifId);
    else if (!aktifId) setPesan([]);
  }, [aktifId, muatRiwayat]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.hidden || !aktifRef.current) return;
      if (aktifRef.current.startsWith("baru:")) return;
      muatRiwayat(aktifRef.current, true);
    }, INTERVAL_CHAT_MS);
    return () => clearInterval(t);
  }, [muatRiwayat]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.hidden) return;
      muatDaftar();
    }, INTERVAL_DAFTAR_MS);
    return () => clearInterval(t);
  }, [muatDaftar]);

  function handleTerkirim(p: PesanItem) {
    setPesan((lama) => gabungPesan(lama, [p]));
    if (!p.id.includes("|ganti:") && !p.id.startsWith("optimis-")) {
      cursorRef.current = p.tanggal;
      void muatDaftar();
    }
  }

  // Deep-link ?dengan=<username> dari tombol "Kirim Pesan" profil.
  useEffect(() => {
    if (!denganUsername) return;
    const target = denganUsername.trim().toLowerCase();
    if (!target) return;
    const cocok = room.find((r) => r.lawan?.username.toLowerCase() === target);
    if (cocok) {
      setAktifId(cocok.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [denganUsername]);

  function handleMulaiBaru(kader: { id: string; username: string }) {
    const cocok = room.find((r) => r.lawan?.id === kader.id);
    if (cocok) {
      setAktifId(cocok.id);
      return;
    }
    const tempId = `baru:${kader.id}`;
    setRoom((lama) => [
      {
        id: tempId,
        pesanTerakhirAt: null,
        lawan: {
          id: kader.id,
          namaLengkap: "",
          username: kader.username,
          fotoProfil: null,
          statusAkun: "AKTIF",
        },
        pesanTerakhir: null,
        belumDibaca: 0,
      },
      ...lama,
    ]);
    setAktifId(tempId);
  }

  const lawanAktif = room.find((r) => r.id === aktifId)?.lawan ?? null;
  const aktifBaru = aktifId?.startsWith("baru:") === true;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <DaftarPercakapan
        room={room.filter((r) => !r.id.startsWith("baru:"))}
        aktifId={aktifBaru ? null : aktifId}
        userId={userId}
        onPilih={setAktifId}
        onMulaiBaru={handleMulaiBaru}
        tersembunyiMobile={aktifId !== null}
      />
      <div className={`flex-1 ${aktifId === null ? "hidden md:block" : "block"}`}>
        {aktifBaru ? (
          <MulaiPercakapanBaru
            aktifId={aktifId as string}
            room={room}
            userId={userId}
            onSiap={(idBaru) => {
              setAktifId(idBaru);
              void muatDaftar();
              void muatRiwayat(idBaru);
            }}
            onKembali={() => setAktifId(null)}
          />
        ) : (
          <JendelaChat
            percakapanId={aktifId}
            lawan={lawanAktif}
            pesan={pesan}
            userId={userId}
            memuat={memuatChat}
            onTerkirim={handleTerkirim}
            onKembali={() => setAktifId(null)}
          />
        )}
      </div>
    </div>
  );
}

function MulaiPercakapanBaru({
  aktifId,
  room,
  userId,
  onSiap,
  onKembali,
}: {
  aktifId: string;
  room: RoomItem[];
  userId: string;
  onSiap: (idBaru: string) => void;
  onKembali: () => void;
}) {
  const entri = room.find((r) => r.id === aktifId);
  const [pesanLokal, setPesanLokal] = useState<PesanItem[]>([]);
  const [eror, setEror] = useState<string | null>(null);

  async function kirimPertama(isi: string) {
    const penerimaId = aktifId.replace("baru:", "");
    setEror(null);
    try {
      const res = await fetch("/api/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ penerimaId, isi }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        percakapanId?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.percakapanId) {
        setEror(data.error ?? "Gagal memulai percakapan.");
        return;
      }
      onSiap(data.percakapanId);
    } catch {
      setEror("Tidak dapat menghubungi server.");
    }
  }

  return (
    <div className="flex min-h-[420px] flex-1 flex-col">
      {eror && (
        <p
          role="alert"
          className="mb-3 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          {eror}
        </p>
      )}
      <JendelaChat
        percakapanId="baru"
        lawan={entri?.lawan ?? null}
        pesan={pesanLokal}
        userId={userId}
        memuat={false}
        onTerkirim={(p) => {
          if (!p.id.startsWith("optimis-")) return;
          setPesanLokal((lama) => gabungPesan(lama, [p]));
          void kirimPertama(p.isi);
        }}
        onKembali={onKembali}
      />
    </div>
  );
}

