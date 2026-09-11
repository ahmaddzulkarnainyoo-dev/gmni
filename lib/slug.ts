import { prisma } from "@/lib/prisma";

/** Mengubah judul bebas menjadi slug URL (a-z, 0-9, tanda hubung). */
export function slugify(teks: string): string {
  return teks
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Menghasilkan slug unik untuk artikel (cek kolom slug di database). */
export async function slugArtikelUnik(judul: string): Promise<string> {
  const dasar = slugify(judul) || "artikel";
  const terpakai = await prisma.artikel.findUnique({ where: { slug: dasar } });
  if (!terpakai) return dasar;
  for (let n = 2; n < 100; n++) {
    const calon = `${dasar}-${n}`;
    const dipakai = await prisma.artikel.findUnique({ where: { slug: calon } });
    if (!dipakai) return calon;
  }
  return `${dasar}-${Date.now()}`;
}