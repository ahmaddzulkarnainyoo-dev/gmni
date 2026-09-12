import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { ambilHalaman, deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await ambilHalaman("kebijakan-privasi");
  return {
    title: h?.judul ?? "Kebijakan Privasi",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanPrivasi() {
  const h = await ambilHalaman("kebijakan-privasi");
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}