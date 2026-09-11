import Link from "next/link";
import { LogoGMNI } from "@/components/brand/LogoGMNI";

/**
 * Kerangka halaman autentikasi: fokus, minim gangguan visual. */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-screen place-items-center bg-kertas-150 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <LogoGMNI className="mx-auto h-12 w-12" />
          <Link
            href="/"
            className="mt-3 inline-block font-serif text-2xl font-extrabold text-hitam-900"
          >
            info{" "}
            <span className="italic text-gmnimerah-500">Marhaen</span>
          </Link>
        </div>
        <div className="border-4 border-hitam-900 bg-white p-6 md:p-8">
          {children}
        </div>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-widest text-hitam-400">
          Hanya kader terverifikasi yang dapat masuk.
        </p>
      </div>
    </main>
  );
}