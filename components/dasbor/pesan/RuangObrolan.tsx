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

type Lawan = {
  id: string;
  namaLengkap: string;
  username: string;
  fotoProfil: string | null;
  statusAkun: string;
};

type RoomItem = {
  id: string;
  pesanTerakhirAt: string | null;
  lawan: Lawan | null;
  pesanTerakhir: { isi: string; tanggal: string; pengirimId: string } | null;
  belumDibaca: number;
};

type KaderBaru = {
  id: string;
  namaLengkap: string;
  username: string;
  fotoProfil?: string | null;
};

// Polling ringan ala plan 3.1: chat aktif 5 dtk, daftar 10 dtk, hanya saat
// tab terlihat (hemat kuota serverless) + refresh langsung saat tab kembali
// aktif agar pesan/room baru terlihat segera, bukan menunggu interval.
const INTERVAL_CHAT_MS = 5000;
const INTERVAL_DAFTAR_MS = 10000;
const AWALAN_TEMP = "baru:";

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

/**
 * Gabungkan daftar room server dengan room sementara "baru:" milik klien.
 * Temp room dipertahankan selama room aslinya belum terlihat dari server,
 * dan dibuang begitu room asli muncul; mapping tempKeAsli dipakai pemanggil
 * untuk memindahkan seleksi aktif ke room asli.
 */
function gabungRoom(
  lama: RoomItem[],
  server: RoomItem[],
): { hasil: RoomItem[]; tempKeAsli: Map<string, string> } {
  const tempKeAsli = new Map<string, string>();
  const sisa: RoomItem[] = [];
  for (const t of lama) {
    if (!t.id.startsWith(AWALAN_TEMP)) continue;
    const asli = server.find((r) => r.lawan?.id === t.id.slice(AWALAN_TEMP.length));
    if (asli) tempKeAsli.set(t.id, asli.id);
    else sisa.push(t);
  }
  return { hasil: [...sisa, ...server], tempKeAsli };
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
  const [erorRiwayat, setErorRiwayat] = useState<string | null>(null);
  const [erorDaftar, setErorDaftar] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const aktifRef = useRef<string | null>(null);
  const roomRef = useRef<RoomItem[]>(awal);
  // Sinkronisasi ref via effect (bukan saat render) sesuai aturan react-hooks/refs.
  useEffect(() => {
    aktifRef.current = aktifId;
  }, [aktifId]);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const muatRiwayat = useCallback(async (id: string, polling = false) => {
    if (!polling) {
      setMemuatChat(true);
      setErorRiwayat(null);
      cursorRef.current = null;
    }
    try {
      const url =
        polling && cursorRef.current
          ? `/api/pesan/${id}?setelah=${encodeURIComponent(cursorRef.current)}`
          : `/api/pesan/${id}`;
      const res = await fetch(url);
      if (!res.ok) {
        // Jangan telan kegagalan sebagai "Belum ada pesan" - tampilkan banner.
        if (!polling) {
          setPesan([]);
          setErorRiwayat("Riwayat percakapan gagal dimuat. Coba lagi sebentar.");
        }
        return;
      }
      const data = (await res.json()) as { pesan?: PesanItem[] };
      const daftar = data.pesan ?? [];
      if (aktifRef.current !== id) return;
      setPesan((lama) => gabungPesan(polling ? lama : [], daftar));
      const terakhir = [...daftar].pop();
      if (terakhir) cursorRef.current = terakhir.tanggal;
      else if (!polling) setPesan([]);
    } catch {
      if (!polling) {
        setErorRiwayat("Tidak dapat menghubungi server untuk memuat riwayat.");
      }
    } finally {
      if (!polling) setMemuatChat(false);
    }
  }, []);

  const muatDaftar = useCallback(async () => {
    try {
      const res = await fetch("/api/pesan/percakapan");
      if (!res.ok) {
        // Permukaan error: jangan diam-diam tampil kosong (terlihat seperti
        // pesan "tidak sampai"). Polling berikutnya mencoba lagi otomatis.
        setErorDaftar("Koneksi ke layanan pesan bermasalah. Mencoba lagi...");
        return;
      }
      const data = (await res.json()) as { percakapan?: RoomItem[] };
      if (!data.percakapan) {
        setErorDaftar("Balasan server tidak valid. Mencoba lagi...");
        return;
      }
      setErorDaftar(null);
      // Merge, bukan replace penuh: room sementara "baru:" jangan sampai
      // hilang digulung polling 10 detik (penyebab panel kanan kosong).
      const { hasil, tempKeAsli } = gabungRoom(roomRef.current, data.percakapan);
      roomRef.current = hasil;
      setRoom(hasil);
      const aktif = aktifRef.current;
      const idAsli = aktif ? tempKeAsli.get(aktif) : undefined;
      if (idAsli) {
        setAktifId(idAsli);
        void muatRiwayat(idAsli);
      }
    } catch {
      setErorDaftar("Tidak dapat menghubungi server pesan. Mencoba lagi...");
    }
  }, [muatRiwayat]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pola orkestrasi polling: muat riwayat saat room berganti
    if (aktifId && !aktifId.startsWith(AWALAN_TEMP)) void muatRiwayat(aktifId);
    else if (!aktifId) setPesan([]);
  }, [aktifId, muatRiwayat]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.hidden || !aktifRef.current) return;
      if (aktifRef.current.startsWith(AWALAN_TEMP)) return;
      void muatRiwayat(aktifRef.current, true);
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

  // Tab kembali terlihat / window fokus: muat daftar (dan chat aktif) SEKARANG,
  // jangan menunggu interval — room/pesan baru langsung tampil (gejala
  // "pesan tidak sampai" selama tab hidden).
  useEffect(() => {
    const segarkan = () => {
      if (document.hidden) return;
      void muatDaftar();
      const aktif = aktifRef.current;
      if (aktif && !aktif.startsWith(AWALAN_TEMP)) {
        void muatRiwayat(aktif, true);
      }
    };
    document.addEventListener("visibilitychange", segarkan);
    window.addEventListener("focus", segarkan);
    return () => {
      document.removeEventListener("visibilitychange", segarkan);
      window.removeEventListener("focus", segarkan);
    };
  }, [muatDaftar, muatRiwayat]);

  function handleTerkirim(p: PesanItem) {
    setPesan((lama) => gabungPesan(lama, [p]));
    if (!p.id.includes("|ganti:") && !p.id.startsWith("optimis-")) {
      cursorRef.current = p.tanggal;
      void muatDaftar();
    }
  }

  // Pilih kader dari pencarian: pakai room asli bila sudah ada (di state
  // maupun di DB), baru buat room sementara bila benar-benar belum obrolan.
  const handleMulaiBaru = useCallback(
    async (kader: KaderBaru) => {
      setErorRiwayat(null);
      const lokal = roomRef.current.find((r) => r.lawan?.id === kader.id);
      if (lokal) {
        setAktifId(lokal.id);
        void muatRiwayat(lokal.id);
        return;
      }
      try {
        const res = await fetch(
          `/api/pesan/percakapan?dengan=${encodeURIComponent(kader.id)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { percakapanId?: string | null };
          if (data.percakapanId) {
            await muatDaftar();
            const asli = roomRef.current.find((r) => r.lawan?.id === kader.id);
            const idRoom = asli?.id ?? data.percakapanId;
            setAktifId(idRoom);
            void muatRiwayat(idRoom);
            return;
          }
        }
      } catch {
        /* gagal jaringan: lanjut buat room sementara */
      }
      const tempId = `${AWALAN_TEMP}${kader.id}`;
      const temp: RoomItem = {
        id: tempId,
        pesanTerakhirAt: null,
        lawan: {
          id: kader.id,
          namaLengkap: kader.namaLengkap,
          username: kader.username,
          fotoProfil: kader.fotoProfil ?? null,
          statusAkun: "AKTIF",
        },
        pesanTerakhir: null,
        belumDibaca: 0,
      };
      roomRef.current = [temp, ...roomRef.current.filter((r) => r.id !== tempId)];
      setRoom(roomRef.current);
      setAktifId(tempId);
    },
    [muatDaftar, muatRiwayat],
  );

  // Deep-link ?dengan=<username> dari tombol "Kirim Pesan" profil:
  // buka room asli bila ada, atau buat room sementara (jangan diam).
  useEffect(() => {
    if (!denganUsername) return;
    const target = denganUsername.trim().toLowerCase();
    if (!target) return;
    void (async () => {
      const sudah = roomRef.current.find(
        (r) => r.lawan?.username.toLowerCase() === target,
      );
      if (sudah) {
        setAktifId(sudah.id);
        return;
      }
      try {
        const res = await fetch(
          `/api/pesan/percakapan?dengan=${encodeURIComponent(target)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as {
            percakapanId?: string | null;
            lawan?: Lawan | null;
          };
          if (data.percakapanId) {
            await muatDaftar();
            const cocok =
              roomRef.current.find(
                (r) => r.lawan?.username.toLowerCase() === target,
              ) ?? roomRef.current.find((r) => r.id === data.percakapanId);
            if (cocok) {
              setAktifId(cocok.id);
              return;
            }
          }
          if (data.lawan) {
            void handleMulaiBaru({
              id: data.lawan.id,
              namaLengkap: data.lawan.namaLengkap,
              username: data.lawan.username,
              fotoProfil: data.lawan.fotoProfil,
            });
            return;
          }
        }
      } catch {
        /* diam - pengguna masih bisa memakai pencarian manual */
      }
    })();
  }, [denganUsername, handleMulaiBaru, muatDaftar]);

  const lawanAktif = room.find((r) => r.id === aktifId)?.lawan ?? null;
  const aktifBaru = aktifId?.startsWith(AWALAN_TEMP) === true;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <DaftarPercakapan
        room={room}
        aktifId={aktifId}
        userId={userId}
        onPilih={setAktifId}
        onMulaiBaru={handleMulaiBaru}
        tersembunyiMobile={aktifId !== null}
        eror={erorDaftar}
      />
      <div className={`flex-1 ${aktifId === null ? "hidden md:block" : "block"}`}>
        {aktifBaru ? (
          <MulaiPercakapanBaru
            aktifId={aktifId as string}
            lawan={lawanAktif}
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
            eror={erorRiwayat}
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
  lawan,
  userId,
  onSiap,
  onKembali,
}: {
  aktifId: string;
  lawan: Lawan | null;
  userId: string;
  onSiap: (idBaru: string) => void;
  onKembali: () => void;
}) {
  const [pesanLokal, setPesanLokal] = useState<PesanItem[]>([]);
  const [eror, setEror] = useState<string | null>(null);

  async function kirimPertama(isi: string) {
    const penerimaId = aktifId.replace(AWALAN_TEMP, "");
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
        lawan={lawan}
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

