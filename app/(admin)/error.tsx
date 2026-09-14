import { GmniError } from "@/components/ui/GmniError";

/** Error boundary area admin (tetap di dalam gate role layout). */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <GmniError area="admin" error={error} retry={retry} />;
}
