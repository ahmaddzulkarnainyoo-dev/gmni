import Link from "next/link";
import { requireRole } from "@/lib/session";
import { LogoGMNI } from "@/components/brand/LogoGMNI";
import { KickerLabel } from "@/components/ui/KickerLabel";

// Named export selain default/metadata dilarang Next 16 di layout — konstanta lokal.
const MENU_ADMIN: Array<{
  grup: string;
  item: Array<{ label: string; href: string }>;
}> = [
  {
    grup: "Redaksi",
    item: [
      { label: "Ringkasan", href: "/admin" },
      { label: "Antrian Redaksi", href: "/admin/redaksi" },
      { label: "Kelola Artikel", href: "/admin/artikel" },
      { label: "Kategori", href: "/admin/kategori" },
      { label: "Tag", href: "/admin/tag" },
      { label: "Moderasi Komentar", href: "/admin/komentar" },
      { label: "Laporan", href: "/admin/laporan" },
      { label: "Kelola Leaderboard", href: "/admin/leaderboard" },
    ],
  },
  {
    grup: "Organisasi",
    item: [
      { label: "Pengguna & Undangan", href: "/admin/pengguna" },
      { label: "Peran & Hak Akses", href: "/admin/peran" },
      { label: "Halaman Statis", href: "/admin/halaman" },
      { label: "Tampilan & Branding", href: "/admin/tampilan" },
      { label: "Iklan & Donasi", href: "/admin/iklan-donasi" },
      { label: "Pengaturan Situs", href: "/admin/pengaturan" },
    ],
  },
  {
    grup: "Sistem",
    item: [{ label: "Audit Log", href: "/admin/audit-log" }],
  },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Gate role (Fase 2): /admin/* hanya untuk Super Admin & Editor (blueprint 5.2).
  // Check permission di masing-masing halaman tetap dipertahankan (defense-in-depth).
  await requireRole("Super Admin", "Editor");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-hitam-900 text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <LogoGMNI warne="putih" className="h-8 w-8" />
          <p className="font-serif text-lg font-bold">
            info{" "}
            <span className="italic text-gmnimerah-400">Marhaen</span>
          </p>
          <span className="ml-2 hidden border border-gmnimerah-500 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-gmnimerah-400 sm:inline-block">
            Admin
          </span>
          <Link
            href="/"
            className="ml-auto font-mono text-[11px] uppercase tracking-widest text-kertas-300 hover:text-gmnimerah-400"
          >
            Lihat Situs
          </Link>
          <Link
            href="/api/auth/signout?callbackUrl=/login"
            className="font-mono text-[11px] uppercase tracking-widest text-kertas-300 hover:text-gmnimerah-400"
          >
            Keluar
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav aria-label="Menu admin" className="sticky top-4">
            {MENU_ADMIN.map((kelompok) => (
              <div key={kelompok.grup} className="mb-4">
                <KickerLabel warne="hitam" className="mb-1.5">
                  {kelompok.grup}
                </KickerLabel>
                <div className="flex flex-col gap-0.5">
                  {kelompok.item.map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="border-l-2 border-transparent px-3 py-1.5 font-sans text-sm font-medium text-hitam-700 transition-colors hover:border-gmnimerah-500 hover:bg-white hover:text-hitam-900"
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}