/**
 * Kueri database aman untuk halaman server admin: bungkus pemanggilan Prisma,
 * catat error ke log server, kembalikan fallback agar halaman tetap render
 * dengan data kosong + banner peringatan (bukan error boundary "Mesin Cetak Macet").
 */
export async function amanAsync<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[kueri-aman] Query database gagal:", error);
    return fallback;
  }
}
