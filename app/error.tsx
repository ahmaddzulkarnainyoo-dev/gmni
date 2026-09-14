import { GmniError } from "@/components/ui/GmniError";

/** Error boundary root (Next 16: client component + retry). */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <GmniError area="publik" error={error} retry={retry} />;
}
