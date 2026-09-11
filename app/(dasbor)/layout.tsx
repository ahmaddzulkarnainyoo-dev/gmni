import Link from "next/link";
import { requireAuthUser } from "@/lib/session";
import { LogoGMNI } from "@/components/brand/LogoGMNI";
import { KickerLabel } from "@/components/ui/KickerLabel";

export const MENU_DASBOR: Array<{ label: string; href: string }> = [
  { label: "Ringkasan", href: "/dasbor" },
  { label: "Tulis Artikel", href: "/dasbor/tulis" },
  { label: "Tulisan Saya", href: "/dasbor/tulisan-saya" },
  { label: "Pesan", href: "/dasbor/pesan" },
  { label: "Notifikasi", href: "/dasbor/notifikasi" },
  { label: "Pencapaian", href: "/dasbor/pencapaian" },
  { label: "Pengaturan", href: "/dasbor/pengaturan" },
];

export default async function DasborLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Hanya kader terverifikasi yang bisa mengakses dasbor.
  const user = await requireAuthUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-hitam-900 text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <LogoGMNI warne="putih" className="h-8 w-8" />
          <Link href="/dasbor" className="font-serif text-lg font-bold">
            info{" "}
            <span className="italic text-gmnimerah-400">Marhaen</span>
          </Link>
          <span className="ml-2 hidden border border-gmnimerah-500 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-gmnimerah-400 sm:inline-block">
            Dasbor Kader
          </span>
          <Link
            href="/"
            className="ml-auto font-mono text-[11px] uppercase tracking-widest text-kertas-300 hover:text-gmnimerah-400"
          >
            Lihat Situs
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav
            aria-label="Menu dasbor"
            className="sticky top-4 flex flex-col gap-1"
          >
            <KickerLabel className="mb-2">Dasbor</KickerLabel>
            {MENU_DASBOR.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="border-l-2 border-transparent px-3 py-2 font-sans text-sm font-medium text-hitam-700 transition-colors hover:border-gmnimerah-500 hover:bg-white hover:text-hitam-900"
              >
                {m.label}
              </Link>
            ))}
            <span className="mt-4 border-t border-hitam-200 pt-3 font-mono text-[11px] uppercase tracking-widest text-hitam-400">
              Masuk sebagai {user.name}
            </span>
            <Link
              href="/api/auth/signout?callbackUrl=/login"
              className="mt-2 border-l-2 border-transparent px-3 py-2 font-sans text-sm font-medium text-gmnimerah-600 transition-colors hover:border-gmnimerah-500 hover:bg-white"
            >
              Keluar
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}