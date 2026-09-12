import "dotenv/config";
import { prisma } from "./lib/prisma";

/** Verifikasi cepat model Tokoh (seed / query smoke-test). */
async function main() {
  const jumlah = await prisma.tokoh.count();
  const contoh = await prisma.tokoh.findMany({
    where: { status: "AKTIF" },
    orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    take: 5,
  });
  console.log(`OK tokoh: ${jumlah} entri`);
  for (const t of contoh) {
    console.log(`- ${t.nama} (${t.slug})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
