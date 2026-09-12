import type { Komentar, User } from "@prisma/client";
import { FormKomentar } from "./FormKomentar";
import { TombolLapor } from "./TombolLapor";

type KomentarArtikel = Komentar & {
  penulis: Pick<User, "id" | "namaLengkap" | "username"> | null;
};

const fmtKomentar = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Kolom komentar artikel — daftar (server) + form + lapor (client). */
export function BagianKomentar({
  slug,
  jumlah,
  komentar,
  login,
  namaUser,
}: {
  slug: string;
  jumlah: number;
  komentar: KomentarArtikel[];
  login: boolean;
  namaUser?: string;
}) {
  return (
    <section id="komentar" className="mt-14 border-t-2 border-hitam-900 pt-6">
      <h2 className="font-serif text-2xl font-extrabold text-hitam-900">
        Komentar <span className="text-gmnimerah-600">({jumlah})</span>
      </h2>

      {komentar.length === 0 ? (
        <p className="mt-4 text-sm text-hitam-500">
          Belum ada komentar. Jadilah yang pertama berdiskusi dengan santun.
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {komentar.map((k) => (
            <li key={k.id} className="border-b border-hitam-100 pb-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
                  {k.penulis ? (
                    <>
                      <span className="text-gmnimerah-600">{k.penulis.namaLengkap}</span>
                      <span className="ml-1 text-hitam-400">· kader</span>
                    </>
                  ) : (
                    k.namaTamu
                  )}
                </p>
                <time
                  dateTime={k.tanggal.toISOString()}
                  className="font-mono text-[11px] uppercase tracking-widest text-hitam-400"
                >
                  {fmtKomentar.format(k.tanggal)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-hitam-800">
                {k.isi}
              </p>
              <div className="mt-2 flex items-center justify-end">
                <TombolLapor id={k.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <FormKomentar slug={slug} login={login} namaAwal={login ? namaUser ?? "" : ""} />
    </section>
  );
}