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
