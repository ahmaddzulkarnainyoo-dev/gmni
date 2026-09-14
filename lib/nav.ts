/**
 * Logika active-state navigasi publik — single source of truth untuk
 * `NavDesktop` dan `MobileNav`. Murni fungsi (tanpa dependensi React),
 * sehingga aturan aktif mudah diverifikasi nalar tiap rute.
 *
 * Aturan:
 * - "/" (Beranda) aktif HANYA pada pathname "/" persis.
 * - href lain aktif jika pathname SAMA PERSIS atau merupakan sub-halaman
 *   pada batas segmen ("/berita" aktif untuk "/berita" & "/berita/politik",
 *   tapi tidak untuk "/berita2"). Ini menjamin "/opini" hanya menyalakan
 *   tab Opini — "/marhaenisme" tetap mati.
 * - Trailing slash diabaikan ("/opini/" diperlakukan sebagai "/opini").
 */
export function jalurAktif(pathname: string, href: string): boolean {
  const jalur = normalisasiJalur(pathname);
  const target = normalisasiJalur(href);
  if (target === "/") return jalur === "/";
  return jalur === target || jalur.startsWith(`${target}/`);
}

function normalisasiJalur(jalur: string): string {
  const bersih = jalur.replace(/\/+$/, "");
  return bersih === "" ? "/" : bersih;
}

/**
 * Role yang berhak masuk area /admin (blueprint 5.2).
 * Single source of truth — dipakai proxy.ts (edge), session gate server,
 * redirect login client, dan visibilitas tombol Admin di header.
 */
export const ROLES_ADMIN = ["Super Admin", "Editor"] as const;

export type NamaRoleAdmin = (typeof ROLES_ADMIN)[number];

export function bolehMasukAdmin(roleNama?: string | null): boolean {
  return roleNama === "Super Admin" || roleNama === "Editor";
}
