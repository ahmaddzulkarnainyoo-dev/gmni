import { cn } from "@/lib/utils";

/**
 * Divider "Trisila" — tiga garis miring yang merepresentasikan
 * Sosio-nasionalisme, Sosio-demokrasi, dan Ketuhanan (Bagian 3).
 * Dipakai sebagai section break, bukan dekorasi acak.
 */
export function DividerTrisila({
  className,
  lebar = "h-1 w-8",
}: {
  className?: string;
  lebar?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center gap-1.5", className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "inline-block skew-x-[-20deg]",
            lebar,
            i === 1 ? "bg-gmnimerah-500" : "bg-hitam-900/70",
          )}
        />
      ))}
    </div>
  );
}