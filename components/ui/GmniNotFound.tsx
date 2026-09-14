import Link from "next/link";
import { LogoGMNI } from "@/components/brand/LogoGMNI";
import { KickerLabel } from "@/components/ui/KickerLabel";

/**
 * Wajah 404 bersama (Sub-Fase 4.2): dipakai root + tiap route group.
 * `area` menentukan CTA kembali yang kontekstual.
 */
export function GmniNotFound({
  area = "publik",
}: {
  area?: "publik" | "dasbor" | "admin" | "auth";
}) {
  const tautan =
    area === "admin"
      ? { href: "/admin", label: "Ke Ringkasan Admin" }
      : area === "dasbor"
        ? { href: "/dasbor", label: "Ke Dasbor" }
        : area === "auth"
          ? { href: "/login", label: "Ke Halaman Masuk" }
          : { href: "/", label: "Ke Beranda" };

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
          <Link
            href={tautan.href}
            className="bg-gmnimerah-500 px-5 py-2.5 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600"
          >
            {tautan.label}
          </Link>
          {area === "publik" && (
            <Link
              href="/berita"
              className="border-2 border-hitam-900 bg-white px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-hitam-900 hover:bg-kertas-150"
            >
              Baca Berita
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
