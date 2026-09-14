"use client";

import { GmniError } from "@/components/ui/GmniError";

/** Error boundary area autentikasi. */
export default function AuthError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <GmniError area="auth" error={error} retry={retry} />;
}
