import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { ambilHalaman, deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await ambilHalaman("pedoman-media-siber");
  return {
    title: h?.judul ?? "Pedoman Media Siber",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanPedoman() {
  const h = await ambilHalaman("pedoman-media-siber");
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}