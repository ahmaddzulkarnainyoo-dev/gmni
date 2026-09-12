import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { ambilHalaman, deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await ambilHalaman("marhaenisme");
  return {
    title: h?.judul ?? "Marhaenisme",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanMarhaenisme() {
  const h = await ambilHalaman("marhaenisme");
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}