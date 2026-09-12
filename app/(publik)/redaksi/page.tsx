import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanStatisView } from "@/components/publik/HalamanStatisView";
import { ambilHalaman, deskripsiDariHalaman } from "@/lib/halaman";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = await ambilHalaman("redaksi");
  return {
    title: h?.judul ?? "Redaksi",
    description: h ? deskripsiDariHalaman(h) : undefined,
  };
}

export default async function HalamanRedaksi() {
  const h = await ambilHalaman("redaksi");
  if (!h) notFound();
  return <HalamanStatisView judul={h.judul} konten={h.konten} />;
}