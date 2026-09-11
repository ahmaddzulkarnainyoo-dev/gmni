#!/usr/bin/env node
/**
 * scripts/generate-favicon.mjs
 *
 * Turunkan `public/logo.png` → `app/favicon.ico` (format ICO dengan PNG
 * incorporato — standard supportato dai browser moderni).
 *
 * Sumber logo resmi: `public/logo.png` (asete pemilik proyek, Bagian 2.3).
 * Memakai `sharp` (transitive dep — optimizer `next/image`) untuk resize
 * multi-resolusi. Idempoten — aman dijalankan berulang:
 *   node scripts/generate-favicon.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "public", "logo.png");
const OUT = join(HERE, "..", "app", "favicon.ico");

/** Ukuran favicon (ICO max 256px — byte 0x00 untuk 256). */
const SIZES = [16, 32, 48, 64, 128, 256];

function icoEntry(size, dataLen, offset) {
  const buf = Buffer.alloc(16);
  buf[0] = size >= 256 ? 0 : size; // width
  buf[1] = size >= 256 ? 0 : size; // height
  buf[2] = 0; // color count
  buf[3] = 0; // reserved
  buf.writeUInt16LE(1, 4); // planes
  buf.writeUInt16LE(32, 6); // bit count (PNG embedded → 32)
  buf.writeUInt32LE(dataLen, 8); // bytes in resource
  buf.writeUInt32LE(offset, 12); // image data offset
  return buf;
}

try {
  // Sanity jumlah sumber
  readFileSync(SRC);

  // Resize a setiap ukuran (crop center → quadrat uniform)
  const pngs = await Promise.all(
    SIZES.map((s) =>
      sharp(SRC)
        .resize({ width: s, height: s, fit: "cover", position: "centre" })
        .png()
        .toBuffer(),
    ),
  );

  // Header ICO: reserved(2) + type=1(2) + count entries(2)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(SIZES.length, 4);

  let offset = 6 + 16 * SIZES.length;
  const entries = [];
  const blobs = [];
  for (let i = 0; i < pngs.length; i += 1) {
    entries.push(icoEntry(SIZES[i], pngs[i].length, offset));
    blobs.push(pngs[i]);
    offset += pngs[i].length;
  }

  const ico = Buffer.concat([header, ...entries, ...blobs]);
  writeFileSync(OUT, ico);
  console.log(`OK  ${OUT}  (${SIZES.length} sizes, ${ico.length} bytes)`);
} catch (e) {
  console.error(
    `GAGAL generate-favicon: ${e.message}\n` +
      "Kebutuhan: `node scripts/generate-favicon.mjs` dijalankan di mesin " +
      "dengan `sharp` tersedia (npm install).",
  );
  process.exitCode = 1;
}