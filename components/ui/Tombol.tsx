import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Varian = "primer" | "sekunder" | "lenyap" | "putih";
type Ukuran = "kecil" | "sedang" | "besar";

const GAYA: Record<Varian, string> = {
  primer:
    "bg-gmnimerah-500 text-white hover:bg-gmnimerah-600 active:bg-gmnimerah-700 focus-visible:outline-gmnimerah-600",
  sekunder:
    "border-2 border-hitam-900 text-hitam-900 hover:bg-hitam-900 hover:text-white focus-visible:outline-hitam-900",
  lenyap:
    "text-gmnimerah-600 underline decoration-gmnimerah-500 decoration-2 underline-offset-4 hover:text-gmnimerah-700",
  putih:
    "bg-white text-hitam-900 hover:bg-gmnimerah-500 hover:text-white focus-visible:outline-white",
};

const UKURAN: Record<Ukuran, string> = {
  kecil: "px-3 py-1.5 text-[12px]",
  sedang: "px-5 py-2.5 text-sm",
  besar: "px-7 py-3.5 text-base",
};

const DASAR =
  "inline-flex items-center justify-center gap-2 font-sans font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

type TombolProps = {
  href?: string;
  varian?: Varian;
  ukuran?: Ukuran;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "type"> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

export function Tombol({
  href,
  varian = "primer",
  ukuran: ukuranPilih = "sedang",
  className,
  children,
  type = "button",
  ...sisa
}: TombolProps) {
  const kelas = cn(DASAR, GAYA[varian], UKURAN[ukuranPilih], className);

  if (href) {
    return (
      <a href={href} className={kelas} {...sisa}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={kelas} {...sisa}>
      {children}
    </button>
  );
}