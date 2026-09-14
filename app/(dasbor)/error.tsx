import { GmniError } from "@/components/ui/GmniError";

/** Error boundary area dasbor kader. */
export default function DasborError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <GmniError area="dasbor" error={error} retry={retry} />;
}
