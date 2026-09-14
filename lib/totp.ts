/**
 * Engine TOTP (RFC 6238) untuk 2FA kader — Sub-Fase 4.2.
 *
 * Tanpa dependensi eksternal: HMAC-SHA1 via node:crypto, base32
 * diimplementasi manual (RFC 4648, tanpa padding). Jendela verifikasi
 * ±1 langkah (30 detik) untuk toleransi jam antar perangkat.
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const ALFABET_BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const LANGKAH_DETIK = 30;
const DIGIT = 6;

/** Buat secret acak (default 20 byte → 32 char base32). */
export function buatSecretTotp(panjangByte = 20): string {
  return base32Encode(randomBytes(panjangByte));
}

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let keluar = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      keluar += ALFABET_BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) keluar += ALFABET_BASE32[(value << (5 - bits)) & 31];
  return keluar;
}

function base32Decode(masukan: string): Buffer {
  const bersih = masukan.trim().replace(/=+$/, "").toUpperCase();
  if (!bersih) throw new Error("Secret TOTP kosong.");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of bersih) {
    const idx = ALFABET_BASE32.indexOf(char);
    if (idx === -1) throw new Error("Secret TOTP tidak valid.");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** URI otpauth:// untuk QR authenticator (Google Authenticator, dsb). */
export function buatUriOtpauth(
  label: string,
  secret: string,
  penerbit = "info Marhaen",
): string {
  const nama = encodeURIComponent(`${penerbit}:${label}`);
  return (
    `otpauth://totp/${nama}?secret=${secret}` +
    `&issuer=${encodeURIComponent(penerbit)}&algorithm=SHA1` +
    `&digits=${DIGIT}&period=${LANGKAH_DETIK}`
  );
}

function hotp(kunci: Buffer, counter: bigint): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(counter);
  const hmac = createHmac("sha1", kunci).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const kode =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(kode % 10 ** DIGIT).padStart(DIGIT, "0");
}

/** Verifikasi kode 6 digit dengan jendela ±`jendela` langkah. */
export function verifikasiTotp(
  secret: string,
  kode: string,
  jendela = 1,
): boolean {
  const normal = kode.replace(/[\s-]/g, "");
  if (!new RegExp(`^\\d{${DIGIT}}$`).test(normal)) return false;
  let kunci: Buffer;
  try {
    kunci = base32Decode(secret);
  } catch {
    return false;
  }
  const counter = BigInt(Math.floor(Date.now() / 1000 / LANGKAH_DETIK));
  for (let i = -jendela; i <= jendela; i += 1) {
    const kandidat = hotp(kunci, counter + BigInt(i));
    if (
      kandidat.length === normal.length &&
      timingSafeEqual(Buffer.from(kandidat), Buffer.from(normal))
    ) {
      return true;
    }
  }
  return false;
}

const ALFABET_PEMULIHAN = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa I, O, 0, 1

/** Buat N kode pemulihan format XXXX-XXXX (dinormalisasi saat verifikasi). */
export function buatKodePemulihan(jumlah = 5): string[] {
  const daftar: string[] = [];
  for (let i = 0; i < jumlah; i += 1) {
    const byte = randomBytes(4);
    let kode = "";
    for (const b of byte) kode += ALFABET_PEMULIHAN[b % ALFABET_PEMULIHAN.length];
    daftar.push(`${kode.slice(0, 4)}-${kode.slice(4)}`);
  }
  return daftar;
}

/** Normalisasi input kode pemulihan (case-insensitive, abaikan spasi/strip). */
export function normalisasiKodePemulihan(kode: string): string {
  return kode.replace(/[\s-]/g, "").toUpperCase();
}
