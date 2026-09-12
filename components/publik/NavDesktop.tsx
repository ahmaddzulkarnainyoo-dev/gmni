"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };
type KatItem = { label: string; slug: string };

/**
 * Tab aktif jika pathname sama persis dengan href, atau merupakan
 * sub-halaman di bawahnya (mis. /berita/politik → tab "Berita" aktif).
 * Beranda ("/") hanya aktif pada pathname "/" persis.
 */
export function jalurAktif(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigasi utama desktop (lg+) — tab merah mengikuti halaman aktif. */
export function NavDesktop({
  navUtama,
  kategoriBerita,
}: {
  navUtama: NavItem[];
  kategoriBerita: KatItem[];
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="hidden items-center lg:flex">
      {navUtama.map((item) => (
        <div key={item.href} className="relative group">
          <Link
            href={item.href}
            aria-current={jalurAktif(pathname, item.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-1 px-3 py-2.5 font-sans text-[13px] font-semibold uppercase tracking-wider transition-colors",
              jalurAktif(pathname, item.href)
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
              {kategoriBerita.map((k) => (
                <Link
                  key={k.slug}
                  href={`/berita/${k.slug}`}
                  aria-current={
                    pathname === `/berita/${k.slug}` ? "page" : undefined
                  }
                  className={cn(
                    "block border-b border-hitam-100 px-4 py-2.5 text-sm font-medium last:border-b-0 hover:bg-gmnimerah-500 hover:text-white",
                    pathname === `/berita/${k.slug}`
                      ? "bg-gmnimerah-500 text-white"
                      : "text-hitam-900",
                  )}
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
        aria-current={jalurAktif(pathname, "/cari") ? "page" : undefined}
        className={cn(
          "px-3 py-2.5 font-sans text-[13px] font-semibold uppercase tracking-wider hover:bg-gmnimerah-500 hover:text-white",
          jalurAktif(pathname, "/cari")
            ? "bg-gmnimerah-500 text-white"
            : "text-hitam-900",
        )}
      >
        Cari
      </Link>
    </nav>
  );
}
