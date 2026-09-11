import { cn } from "@/lib/utils";

/**
 * Label rubrik ala koran: teks kecil kapital + batang merah vertikal.
 * Dipakai untuk "BREAKING", "OPINI", "MARHAENISME", dll.
 */
export function KickerLabel({
  children,
  warne = "merah",
  className,
}: {
  children: React.ReactNode;
  warne?: "merah" | "hitam" | "putih";
  className?: string;
}) {
  const warnaKata =
    warne === "merah"
      ? "text-gmnimerah-500"
      : warne === "putih"
        ? "text-white"
        : "text-hitam-900";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]",
        warnaKata,
        className,
      )}
    >
      <span
        aria-hidden
        className="h-3.5 w-1.5 shrink-0 bg-gmnimerah-500"
      />
      {children}
    </span>
  );
}