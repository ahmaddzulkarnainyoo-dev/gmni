import { LogoGMNI } from "@/components/brand/LogoGMNI";
import { KickerLabel } from "@/components/ui/KickerLabel";
import { Tombol } from "@/components/ui/Tombol";

/**
 * Halaman 404 — memakai motif banteng/maskot & Trisila (Bagian 3).
 */
export default function NotFoundPage() {
  return (
    <main className="grid flex-1 place-items-center bg-kertas-150 px-4 py-20">
      <div className="max-w-lg border-4 border-hitam-900 bg-white p-8 text-center">
        <LogoGMNI className="mx-auto h-16 w-16" />
        <h1 className="mt-6 font-serif text-5xl font-extrabold text-gmnimerah-500">
          404
        </h1>
        <KickerLabel warne="hitam" className="mt-4 justify-center">
          Halaman Tidak Ditemukan
        </KickerLabel>
        <p className="mt-4 text-hitam-500">
          Berita utama dihapus atau tautan keliru. Barisan tidak berhenti di
          jalan buntu.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Tombol href="/" varian="primer">
            Ke Beranda
          </Tombol>
          <Tombol href="/berita" varian="sekunder">
            Baca Berita
          </Tombol>
        </div>
      </div>
    </main>
  );
}