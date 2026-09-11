import { KickerLabel } from "./KickerLabel";

/**
 * Halaman sementara untuk rute yang belum dibangun pada fase berjalan.
 * Didesain tetap konsisten (merah/hitam/kertas) agar fase 0 terasa utuh.
 */
export function Pembangunan({
  judul,
  deskripsi,
  fase,
}: {
  judul: string;
  deskripsi?: string;
  fase?: string;
}) {
  return (
    <section className="border-l-4 border-gmnimerah-500 bg-white p-6 md:p-10">
      <KickerLabel warne="hitam">
        {fase ?? "Dalam Pembangunan"}
      </KickerLabel>
      <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-hitam-900 md:text-4xl">
        {judul}
      </h1>
      <p className="mt-3 max-w-2xl text-hitam-500">
        {deskripsi ??
          "Halaman ini akan diisi pada fase berikutnya sesuai roadmap blueprint."}
      </p>
    </section>
  );
}