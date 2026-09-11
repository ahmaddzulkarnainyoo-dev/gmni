import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await prisma.halamanStatis.findUnique({ where: { slug: "pedoman-media-siber" } });
  return {
    title: h?.judul ?? "Pedoman Media Siber",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanPedoman() {
  const h = await prisma.halamanStatis.findUnique({ where: { slug: "pedoman-media-siber" } });
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}