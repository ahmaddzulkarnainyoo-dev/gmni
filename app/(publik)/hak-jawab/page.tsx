import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await prisma.halamanStatis.findUnique({ where: { slug: "hak-jawab" } });
  return {
    title: h?.judul ?? "Hak Jawab",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanHakJawab() {
  const h = await prisma.halamanStatis.findUnique({ where: { slug: "hak-jawab" } });
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}