"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (key: string, opts: { action: string }) => Promise<string>;
    };
  }
}

function muatScriptReCaptcha(): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector("script[data-recaptcha]")) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.dataset.recaptcha = "1";
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

async function dapatkanTokenReCaptcha(): Promise<string | null> {
  if (!RECAPTCHA_SITE_KEY) return "dev-no-recaptcha"; // kunci belum disetel — mode dev.
  try {
    await muatScriptReCaptcha();
    const g = window.grecaptcha;
    if (!g) return null;
    return await new Promise<string | null>((resolve) => {
      g.ready(async () => {
        try {
          resolve(await g.execute(RECAPTCHA_SITE_KEY, { action: "komentar" }));
        } catch {
          resolve(null);
        }
      });
    });
  } catch {
    return null;
  }
}

/** Form komentar publik di halaman artikel (blueprint 8.3). */
export function FormKomentar({
  slug,
  login = false,
  namaAwal = "",
}: {
  slug: string;
  login?: boolean;
  namaAwal?: string;
}) {
  const router = useRouter();
  const [nama, setNama] = useState(namaAwal);
  const [isi, setIsi] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    setInfo(null);
    try {
      const recaptchaToken = await dapatkanTokenReCaptcha();
      const res = await fetch("/api/komentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          nama,
          isi,
          recaptchaToken: recaptchaToken ?? undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal mengirim komentar.");
        return;
      }
      setIsi("");
      setInfo("Komentar terkirim. Terima kasih sudah berdiskusi.");
      router.refresh();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <form onSubmit={kirim} className="mt-8 border-2 border-hitam-900 bg-kertas-100 p-5">
      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
        Tinggalkan Komentar
      </p>

      {!login && (
        <label className="mt-4 block">
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
            Nama Anda
          </span>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            minLength={3}
            maxLength={80}
            placeholder="mis. Kader Pancasila"
            className="w-full border-2 border-hitam-900 bg-white px-3 py-2 font-sans text-sm text-hitam-900 outline-none focus:border-gmnimerah-500"
          />
        </label>
      )}

      <label className="mt-4 block">
        <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Isi Komentar
        </span>
        <textarea
          required
          rows={4}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          minLength={3}
          maxLength={1500}
          placeholder="Tulis pemikiran Anda dengan santun dan sesuai pedoman diskusi."
          className="w-full resize-y border-2 border-hitam-900 bg-white px-3 py-3 font-sans text-sm leading-relaxed text-hitam-900 outline-none focus:border-gmnimerah-500"
        />
        <span className="mt-1 block text-right text-xs text-hitam-400">{isi.length}/1500</span>
      </label>

      <p className="mt-1 text-xs text-hitam-400">
        Dilindungi verifikasi anti-bot (Google reCAPTCHA v3). Komentar Anda tampil publik.
      </p>

      {info && (
        <p
          role="status"
          className="mt-3 border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800"
        >
          {info}
        </p>
      )}
      {eror && (
        <p
          role="alert"
          className="mt-3 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700"
        >
          {eror}
        </p>
      )}

      <button
        type="submit"
        disabled={memuat}
        className="mt-4 bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
      >
        {memuat ? "Mengirim..." : "Kirim Komentar"}
      </button>
    </form>
  );
}