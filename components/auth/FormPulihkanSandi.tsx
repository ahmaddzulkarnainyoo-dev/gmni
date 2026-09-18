"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Formulir pemulihan sandi via token sekali-pakai (?token=).
 * Sukses → arahkan ke /login dengan sandi baru.
 */
export function FormPulihkanSandi({ token }: { token: string }) {
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sandiBaru.length < 12) {
      setEror("Sandi minimal 12 karakter demi keamanan kader.");
      return;
    }
    if (sandiBaru !== konfirmasi) {
      setEror("Konfirmasi sandi tidak sama.");
      return;
    }
    setMemuat(true);
    setEror(null);
    try {
      const res = await fetch("/api/auth/pulihkan-sandi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sandiBaru, konfirmasi }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; pesan?: string; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setEror(data?.error ?? "Gagal memperbarui sandi.");
        return;
      }
      setSukses(data.pesan ?? "Sandi berhasil diperbarui.");
    } catch {
      setEror("Tidak dapat menghubungi server. Coba beberapa saat lagi.");
    } finally {
      setMemuat(false);
    }
  }

  if (sukses) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900">
          Sandi Diperbarui
        </h1>
        <p
          role="status"
          className="border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800"
        >
          {sukses}
        </p>
        <Link
          href="/login"
          className="inline-block bg-gmnimerah-500 px-5 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600"
        >
          Masuk dengan Sandi Baru
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={kirim} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900">
          Pulihkan Kata Sandi
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Buat sandi baru untuk akun Anda. Minimal 12 karakter.
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
          Sandi Baru (min. 12 karakter)
        </span>
        <input
          type="password"
          required
          minLength={12}
          value={sandiBaru}
          onChange={(e) => setSandiBaru(e.target.value)}
          className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none transition-colors focus:border-gmnimerah-500"
          placeholder="••••••••••••"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Konfirmasi Sandi Baru
        </span>
        <input
          type="password"
          required
          minLength={12}
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none transition-colors focus:border-gmnimerah-500"
          placeholder="••••••••••••"
        />
      </label>

      <button
        type="submit"
        disabled={memuat}
        className="w-full bg-gmnimerah-500 px-5 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
      >
        {memuat ? "Menyimpan..." : "Simpan Sandi Baru"}
      </button>
    </form>
  );
}