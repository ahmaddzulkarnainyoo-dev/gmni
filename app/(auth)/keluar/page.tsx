import Link from "next/link";

/** Jaring pengaman signout — jika /api/auth/signout diakses langsung (GET),
 * NextAuth dialihkan ke halaman ini (pages.signOut di lib/auth.ts) sehingga
 * UI default NextAuth berbahasa Inggris tidak pernah tampil. */
export default function HalamanKeluar() {
  return (
    <div className="border-2 border-hitam-900 bg-kertas-50 shadow-[6px_6px_0_0_var(--color-hitam-900)]">
      <div className="border-b-2 border-hitam-900 bg-hitam-900 px-5 py-3 text-white">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
          Sesi Berakhir
        </p>
      </div>
      <div className="px-5 py-8 text-center">
        <p aria-hidden className="font-mono text-4xl">
          ✦
        </p>
        <h1 className="mt-3 font-serif text-xl font-bold text-hitam-900">
          Anda telah keluar
        </h1>
        <p className="mx-auto mt-2 max-w-xs font-sans text-sm text-hitam-600">
          Sesi Anda telah berakhir dengan aman. Terima kasih atas kontribusi
          Anda untuk pers Marhaen.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-11 items-center border-2 border-hitam-900 bg-hitam-900 px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600 hover:border-red-600"
        >
          Kembali ke Halaman Masuk
        </Link>
      </div>
    </div>
  );
}
