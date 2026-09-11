import { cn } from "@/lib/utils";

/**
 * Emblem "bintang" GMNI — PLACEHOLDER sementara.
 * Blueprint Bagian 2.3: logo resmi `logo.jpg` akan menggantikan SVG ini
 * (letakkan di /public/brand/logo.jpg). Bintang dipakai sebagai
 * badge pencapaian maupun wordmark (Bagian 3).
 */
export function LogoGMNI({
  className,
  warne = "merah",
  label = "info Marhaen",
}: {
  className?: string;
  warne?: "merah" | "putih" | "hitam";
  label?: string;
}) {
  const warna =
    warne === "putih" ? "#ffffff" : warne === "hitam" ? "#141414" : "#e53935";
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 64 64"
      className={cn("h-10 w-10", className)}
    >
      <title>{label}</title>
      {/* Bintang bersudut lima — cita-cita kerakyatan */}
      <path
        fill={warna}
        d="M32 4 39.6 18.6 55.7 20.4 44.2 31.2 47.9 47.1 32 39.2 16.1 47.1 19.8 31.2 8.3 20.4 24.4 18.6z"
      />
      {/* Segitiga Trisila di tengah bintang */}
      <path fill="#ffffff" opacity="0.9" d="M32 27l7 12H25z" />
    </svg>
  );
}