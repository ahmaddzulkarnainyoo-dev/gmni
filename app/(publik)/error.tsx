"use client";

import { GmniError } from "@/components/ui/GmniError";

/** Error boundary area publik. */
export default function PublikError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <GmniError area="publik" error={error} retry={retry} />;
}
