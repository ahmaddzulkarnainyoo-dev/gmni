"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

/** Formulir masuk (Credentials) — dikirim ke endpoint NextAuth. */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const tujuan = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dasbor";

  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    const hasil = await signIn("credentials", {
      redirect: false,
      email,
      password: sandi,
    });
    if (hasil?.error) {
      setEror("Email atau sandi salah. Pastikan akun berstatus aktif.");
      setMemuat(false);
      return;
    }
    router.push(tujuan);
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900">
          Masuk Kader
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Gunakan email dan sandi yang terdaftar sebagai kader terverifikasi.
        </p>
      </div>

      {eror && (
        <p
          role="alert"
          className="border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          {eror}
        </p>
      )}

      <label className="block">
        <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none transition-colors focus:border-gmnimerah-500"
          placeholder="kader@contoh.id"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Sandi
        </span>
        <input
          type="password"
          required
          value={sandi}
          onChange={(e) => setSandi(e.target.value)}
          className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none transition-colors focus:border-gmnimerah-500"
          placeholder="••••••••"
        />
      </label>

      <button
        type="submit"
        disabled={memuat}
        className="w-full bg-gmnimerah-500 px-5 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
      >
        {memuat ? "Memeriksa..." : "Masuk"}
      </button>

      <p className="pt-1 text-center text-sm text-hitam-500">
        Lupa sandi?{" "}
        <Link
          href="/lupa-password"
          className="font-semibold text-gmnimerah-600 underline decoration-2 underline-offset-4"
        >
          Pulihkan di sini
        </Link>
      </p>
    </form>
  );
}