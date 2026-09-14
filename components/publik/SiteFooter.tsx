import Link from "next/link";
import {
  HALAMAN_INFO,
  HALAMAN_LEGAL,
  KATEGORI_BERITA,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";
import { DividerTrisila } from "@/components/ui/DividerTrisila";

export function SiteFooter() {
  const tahun = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t-4 border-gmnimerah-500 bg-hitam-900 text-kertas-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {/* Logo resmi GMNI (public/logo.png) */}
            <img
              src="/logo.png"
              alt={SITE_NAME}
              width={1456}
              height={1440}
              className="h-10 w-10 object-contain"
            />
            <p className="font-serif text-2xl font-extrabold text-white">
              info <span className="italic text-gmnimerah-400">Marhaen</span>
            </p>
          </div>
          <p className="text-sm leading-relaxed text-kertas-300">{SITE_TAGLINE}</p>
          <p className="text-sm leading-relaxed text-kertas-300">
            Media oposisi yang lahir dari gerakan mahasiswa. Berpihak pada
            rakyat kecil, setia pada Trisila.
          </p>
          <Link
            href="/donasi"
            className="inline-block border border-gmnimerah-500 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-gmnimerah-400 transition-colors hover:bg-gmnimerah-500 hover:text-white"
          >
            Dukung Perjuangan Ini →
          </Link>
        </div>

        {/* Kategori */}
        <nav aria-label="Kategori">
          <p className="mb-4 border-l-2 border-gmnimerah-500 pl-2 font-mono text-[12px] font-bold uppercase tracking-widest text-white">
            Kanal
          </p>
          <ul className="space-y-2 text-sm">
            {KATEGORI_BERITA.map((k) => (
              <li key={k.slug}>
                <Link
                  href={`/berita/${k.slug}`}
                  className="text-kertas-300 transition-colors hover:text-gmnimerah-400"
                >
                  {k.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/marhaenisme"
                className="text-gmnimerah-400 transition-colors hover:text-white"
              >
                Marhaenisme
              </Link>
            </li>
            <li>
              <Link
                href="/opini"
                className="text-kertas-300 transition-colors hover:text-gmnimerah-400"
              >
                Opini
              </Link>
            </li>
          </ul>
        </nav>

        {/* Info */}
        <nav aria-label="Info">
          <p className="mb-4 border-l-2 border-gmnimerah-500 pl-2 font-mono text-[12px] font-bold uppercase tracking-widest text-white">
            Info
          </p>
          <ul className="space-y-2 text-sm">
            {HALAMAN_INFO.map((h) => (
              <li key={h.href}>
                <Link
                  href={h.href}
                  className="text-kertas-300 transition-colors hover:text-gmnimerah-400"
                >
                  {h.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal">
          <p className="mb-4 border-l-2 border-gmnimerah-500 pl-2 font-mono text-[12px] font-bold uppercase tracking-widest text-white">
            Legal
          </p>
          <ul className="space-y-2 text-sm">
            {HALAMAN_LEGAL.map((h) => (
              <li key={h.href}>
                <Link
                  href={h.href}
                  className="text-kertas-300 transition-colors hover:text-gmnimerah-400"
                >
                  {h.label}
                </Link>
              </li>
            ))}
          </ul>
          <DividerTrisila className="mt-6" />
        </nav>
      </div>

      <div className="border-t border-hitam-700">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center font-mono text-[11px] uppercase tracking-widest text-kertas-400 sm:flex-row">
          <p>
            © {tahun} {SITE_NAME} — GMNI
          </p>
          <p>Dibangun oleh kader, untuk rakyat.</p>
        </div>
      </div>
    </footer>
  );
}