/**
 * Helper pemulihan sandi (Fase 4.3 — lupa sandi):
 * - Token sekali pakai 32-byte hex (64 karakter), berlaku 30 menit (admin: 24 jam).
 * - Kirim email via Resend REST API (tanpa dependensi tambahan) bila
 *   RESEND_API_KEY dikonfigurasi; tanpa key → tautan hanya ke log server
 *   (server-side) dan admin dapat membuat tautan manual di /admin/pengguna.
 */
import { randomBytes } from "node:crypto";

/** Masa berlaku token yang diminta kader sendiri (menit). */
export const MASA_PEMULIHAN_MENIT = 30;
/** Masa berlaku token yang dibuat manual oleh admin (jam). */
export const MASA_PEMULIHAN_ADMIN_JAM = 24;

/** Token acak sekali pakai (64 karakter hex). */
export function tokenPemulihanBaru(): string {
  return randomBytes(32).toString("hex");
}

/** URL dasar aplikasi untuk tautan email (NEXTAUTH_URL → origin request). */
export function urlDasar(request: Request): string {
  const env = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (env) return env;
  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  return "http://localhost:3000";
}

export type HasilEmail = "terkirim" | "tanpa_key" | "gagal";

/**
 * Kirim email tautan pemulihan via Resend REST API (native fetch).
 * RESEND_API_KEY tidak ada → "tanpa_key" (pemanggil log tautan ke server).
 */
export async function kirimEmailPemulihan(
  email: string,
  tautan: string,
): Promise<HasilEmail> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "tanpa_key";
  const dari = process.env.EMAIL_DARI ?? "info Marhaen <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: dari,
        to: [email],
        subject: "Pemulihan Kata Sandi — info Marhaen",
        text: [
          "Halo kader,",
          "",
          "Kami menerima permintaan pemulihan kata sandi untuk akun ini.",
          `Tautan berlaku ${MASA_PEMULIHAN_MENIT} menit dan hanya bisa dipakai sekali:`,
          "",
          tautan,
          "",
          "Bila bukan Anda yang meminta, abaikan email ini — sandi Anda tidak berubah.",
          "",
          "Redaksi info Marhaen",
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error(
        "[pemulihan] Resend menolak email:",
        res.status,
        (await res.text().catch(() => "")).slice(0, 200),
      );
      return "gagal";
    }
    return "terkirim";
  } catch (error) {
    console.error("[pemulihan] Gagal mengirim email:", error);
    return "gagal";
  }
}