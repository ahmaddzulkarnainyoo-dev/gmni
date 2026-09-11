import { IBM_Plex_Mono, Inter, Lora } from "next/font/google";

/**
 * Pasangan tipografi "pers/jurnalistik" (blueprint.md Bagian 3.1):
 * - Lora (serif)          → judul/headline artikel, kesan otoritatif media cetak
 * - Inter (sans-serif)    → UI & body text, keterbacaan tinggi
 * - IBM Plex Mono (mono)  → label kicker, ticker, angka — ala teleprinter redaksi
 */

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  variable: "--font-plexmono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});