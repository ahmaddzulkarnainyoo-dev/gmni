import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke dasbor kader info Marhaen.",
};

export default function HalamanMasuk() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}