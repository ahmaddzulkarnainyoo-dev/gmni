"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { jalurAktif } from "@/lib/nav";

export { jalurAktif };

type NavItem = { label: string; href: string };
type KatItem = { label: string; slug: string };

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
    <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
      {navUtama.map((item) => (
        <div key={item.href} className="relative group">
          <Link
            href={item.href}
            aria-current={jalurAktif(pathname, item.href) ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-1 px-3 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.12em] transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gmnimerah-600 after:transition-transform after:duration-200 hover:after:scale-x-100",
              jalurAktif(pathname, item.href)
                ? "text-gmnimerah-600 after:scale-x-100"
                : "text-hitam-900 hover:text-gmnimerah-600",
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
                    "block border-b border-hitam-100 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gmnimerah-50 hover:text-gmnimerah-700",
                    pathname === `/berita/${k.slug}`
                      ? "border-l-4 border-gmnimerah-600 bg-gmnimerah-50 font-bold text-gmnimerah-700"
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
          "relative px-3 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-hitam-900 transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gmnimerah-600 after:transition-transform after:duration-200 hover:text-gmnimerah-600 hover:after:scale-x-100",
          jalurAktif(pathname, "/cari")
            ? "text-gmnimerah-600 after:scale-x-100"
            : "",
        )}
      >
        Cari
      </Link>
    </nav>
  );
}
