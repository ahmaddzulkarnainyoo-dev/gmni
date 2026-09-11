import { cn } from "@/lib/utils";
import { LogoGMNI } from "@/components/brand/LogoGMNI";

/**
 * Lencana pencapaian kader (Bagian 3: Bintang = cita-cita kerakyatan;
 * Bagian 8.4: trophy case permanen di profil & /dasbor/pencapaian).
 */
export function BadgeBintang({
  label,
  tanggal,
  className,
}: {
  label: string;
  tanggal?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border border-hitam-200 bg-kertas-100 p-3",
        className,
      )}
    >
      <LogoGMNI className="h-9 w-9 shrink-0" />
      <div className="min-w-0">
        <p className="font-serif text-sm font-bold leading-tight text-hitam-900">
          {label}
        </p>
        {tanggal && (
          <p className="font-mono text-[11px] uppercase tracking-wider text-hitam-400">
            {tanggal}
          </p>
        )}
      </div>
    </div>
  );
}