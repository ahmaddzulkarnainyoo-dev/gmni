import type { Metadata } from "next";
import { FormLupaSandi } from "@/components/auth/FormLupaSandi";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi",
  description:
    "Minta tautan pemulihan kata sandi akun kader info Marhaen (berlaku 30 menit, sekali pakai).",
};

/** Halaman minta tautan pemulihan sandi — alur token sekali pakai. */
export default function HalamanLupaSandi() {
  return <FormLupaSandi />;
}