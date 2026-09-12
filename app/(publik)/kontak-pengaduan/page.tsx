import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { ambilHalaman, deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await ambilHalaman("kontak-pengaduan");
  return {
    title: h?.judul ?? "Kontak & Pengaduan",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanKontak() {
  const h = await ambilHalaman("kontak-pengaduan");
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}