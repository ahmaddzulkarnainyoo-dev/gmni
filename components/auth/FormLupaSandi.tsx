"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Formulir permintaan tautan pemulihan sandi.
 * Respons API selalu generik (anti-enumeration) — pesan sukses sama baik
 * email terdaftar maupun tidak.
 */
export function FormLupaSandi() {
  const [email, setEmail] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [terkirim, setTerkirim] = useState(false);
  const [eror, setEror] = useState<string | null>(null);

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    try {
      const res = await fetch("/api/auth/lupa-sandi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as
        | { pesan?: string; error?: string }
        | null;
      if (res.status === 429) {
        setEror(
          data?.error ??
            "Terlalu banyak permintaan. Coba lagi dalam satu menit.",
        );
        return;
      }
      setTerkirim(true);
    } catch {
      setEror("Tidak dapat menghubungi server. Coba beberapa saat lagi.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <form onSubmit={kirim} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900">
          Lupa Kata Sandi
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Masukkan email terdaftar. Kami akan mengirim tautan pemulihan yang
          berlaku 30 menit dan hanya bisa dipakai sekali.
        </p>
      </div>

      {terkirim ? (
        <div className="space-y-3">
          <p
            role="status"
            className="border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800"
          >
            Jika email terdaftar, tautan pemulihan telah dikirim. Periksa folder
            spam; bila tidak menerima dalam 30 menit, hubungi Admin Redaksi
            atau minta tautan baru.
          </p>
          <p className="text-center text-sm text-hitam-500">
            <Link
              href="/login"
              className="font-semibold text-gmnimerah-600 underline decoration-2 underline-offset-4"
            >
              Kembali ke halaman masuk
            </Link>
          </p>
        </div>
      ) : (
        <>
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
              Email Terdaftar
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
          <button
            type="submit"
            disabled={memuat}
            className="w-full bg-gmnimerah-500 px-5 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
          >
            {memuat ? "Mengirim..." : "Kirim Tautan Pemulihan"}
          </button>
          <p className="pt-1 text-center text-sm text-hitam-500">
            <Link
              href="/login"
              className="font-semibold text-gmnimerah-600 underline decoration-2 underline-offset-4"
            >
              Kembali ke halaman masuk
            </Link>
          </p>
        </>
      )}
    </form>
  );
}