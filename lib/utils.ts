/**
 * Utilitas kecil penggabung nama kelas Tailwind.
 * Menghindari dependensi tambahan (clsx/tailwind-merge) di fase awal.
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}