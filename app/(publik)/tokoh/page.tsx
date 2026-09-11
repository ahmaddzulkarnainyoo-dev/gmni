import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await prisma.halamanStatis.findUnique({ where: { slug: "tokoh" } });
  return {
    title: h?.judul ?? "Tokoh",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanTokoh() {
  const h = await prisma.halamanStatis.findUnique({ where: { slug: "tokoh" } });
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}