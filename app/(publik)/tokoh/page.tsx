import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await prisma.halamanStatis.findUnique({ where: { slug: "tokoh" } });
  return {
    title: h?.judul ?? "Tokoh",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

function tahun(angka: number | null): string {
  return angka ? String(angka) : "?";
}

export default async function HalamanTokoh() {
  const [tokoh, intro] = await Promise.all([
    prisma.tokoh.findMany({
      where: { status: "AKTIF" },
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    }),
    prisma.halamanStatis.findUnique({ where: { slug: "tokoh" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="max-w-3xl">
        <h1 className="font-serif text-3xl font-extrabold leading-tight text-hitam-900 md:text-4xl">
          {intro?.judul ?? "Tokoh Marhaenis"}
        </h1>
        <div aria-hidden className="mt-4 h-1.5 w-16 bg-gmnimerah-500" />
        {intro && (
          <div
            className="konten-artikel mt-6"
            dangerouslySetInnerHTML={{ __html: intro.konten }}
          />
        )}
      </header>

      {tokoh.length === 0 ? (
        <div className="mt-10 border-4 border-dashed border-hitam-200 bg-kertas-100 p-10 text-center">
          <p className="font-serif text-xl font-bold text-hitam-900">
            Profil tokoh sedang disusun redaksi.
          </p>
          <p className="mt-2 text-sm text-hitam-500">
            Kembali lagi untuk membaca jejak para pejuang Marhaenisme.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tokoh.map((t) => (
            <article
              key={t.id}
              className="flex flex-col overflow-hidden border-2 border-hitam-900 bg-white"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-hitam-900">
                {t.gambar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.gambar}
                    alt={t.nama}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center font-serif text-6xl font-extrabold text-white/30">
                    {t.nama.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-serif text-xl font-bold text-hitam-900">{t.nama}</h2>
                {t.julukan && (
                  <p className="mt-0.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-gmnimerah-600">
                    {t.julukan}
                  </p>
                )}
                {(t.lahir || t.wafat) && (
                  <p className="mt-1 font-mono text-[12px] text-hitam-400">
                    {tahun(t.lahir)} – {t.wafat ? tahun(t.wafat) : "sekarang"}
                  </p>
                )}
                {t.kutipan && (
                  <p className="mt-3 border-l-2 border-gmnimerah-500 pl-3 text-sm italic leading-relaxed text-hitam-600">
                    “{t.kutipan}”
                  </p>
                )}
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-hitam-500">
                  {t.biografi}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}