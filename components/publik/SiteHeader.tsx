import Link from "next/link";
import {
  KATEGORI_BERITA,
  NAV_UTAMA,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import { LogoGMNI } from "@/components/brand/LogoGMNI";
import { DividerTrisila } from "@/components/ui/DividerTrisila";

function TanggalHariIni() {
  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return <time className="uppercase">{tanggal}</time>;
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Kanal atas — hitam */}
      <div className="bg-hitam-900 text-kertas-200">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-4 px-4 font-mono text-[11px] uppercase tracking-widest">
          <span className="hidden text-kertas-300 sm:block">
            <TanggalHariIni />
          </span>
          <span className="flex-1 truncate text-center text-gmnimerah-400 sm:text-right sm:flex-none">
            Suara rakyat kecil — oposisi kebijakan
          </span>
          <nav aria-label="Akun" className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-kertas-200 transition-colors hover:text-gmnimerah-400"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="bg-gmnimerah-500 px-2 py-0.5 text-white transition-colors hover:bg-gmnimerah-400"
            >
              Registrasi Kader
            </Link>
          </nav>
        </div>
      </div>

      {/* Masthead — wordmark media */}
      <div className="border-b-4 border-gmnimerah-500 bg-kertas-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <Link href="/" className="flex items-center gap-3" aria-label={SITE_NAME}>
            <LogoGMNI className="h-12 w-12" />
            <div className="leading-none">
              <p className="font-serif text-4xl font-extrabold tracking-tight text-hitam-900 sm:text-5xl">
                info{" "}
                <span className="italic text-gmnimerah-500">Marhaen</span>
              </p>
              <p className="mt-2 hidden font-mono text-[11px] uppercase tracking-[0.28em] text-hitam-500 sm:block">
                {SITE_TAGLINE}
              </p>
            </div>
          </Link>
          <DividerTrisila className="hidden lg:flex" lebar="h-1 w-10" />
        </div>
      </div>

      {/* Ticker breaking — merah */}
      <div className="bg-gmnimerah-500 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5">
          <span className="shrink-0 bg-black px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest">
            Terbaru
          </span>
          <p className="truncate font-mono text-[12px] uppercase tracking-wide">
            Fase 0 — Fondasi design system GMNI telah diinisialisasi.
            Konter berita akan menyala saat edisi pertama terbit.
          </p>
        </div>
      </div>

      {/* Navigasi utama — kategori */}
      <div className="border-b-2 border-hitam-900 bg-kertas-150">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-6xl items-center px-4"
        >
          {NAV_UTAMA.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 px-3 py-2.5 font-sans text-[13px] font-semibold uppercase tracking-wider transition-colors",
                  item.aksen
                    ? "bg-gmnimerah-500 text-white"
                    : "text-hitam-900 hover:bg-gmnimerah-500 hover:text-white",
                )}
              >
                {item.label}
                {item.href === "/berita" && (
                  <span aria-hidden className="text-[10px]">
                    ▾
                  </span>
                )}
              </Link>
              {item.href === "/berita" && (
                <div className="invisible absolute left-0 top-full z-50 w-56 border border-hitam-200 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {KATEGORI_BERITA.map((k) => (
                    <Link
                      key={k.slug}
                      href={`/berita/${k.slug}`}
                      className="block border-b border-hitam-100 px-4 py-2.5 text-sm font-medium text-hitam-900 last:border-b-0 hover:bg-gmnimerah-500 hover:text-white"
                    >
                      {k.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/cari"
            aria-label="Cari"
            className="ml-auto px-3 py-2.5 font-sans text-[13px] font-semibold uppercase tracking-wider text-hitam-900 hover:bg-gmnimerah-500 hover:text-white"
          >
            Cari
          </Link>
        </nav>
      </div>
    </header>
  );
}