#!/usr/bin/env node
/**
 * scripts/patch-next-fat32.mjs
 *
 * Patch sementara untuk Next.js 16 di mesin yang node_modules-nya berada
 * pada volume FAT32 (contoh: drive D: pada mesin pengembang) yang TIDAK
 * mendukung symlink/junction. Akibatnya `fs.readlink` melempar EISDIR untuk
 * berkas biasa (di NTFS: EINVAL). Webpack build lalu crash dengan:
 *   EISDIR: illegal operation on a directory, readlink '...\[slug]\route.ts'
 *
 * Script ini idempoten — aman dijalankan berulang:
 *   node scripts/patch-next-fat32.mjs
 *
 * Catatan: patch berada di node_modules (tidak ter-commit). Setelah `npm install`
 * penuh ulang, jalankan ulang script ini.
 */
import { readFileSync, writeFileSync } from "node:fs";

const TARGETS = [
  {
    path: "node_modules/next/dist/build/collect-build-traces.js",
    cari: "(e.code === 'EINVAL' || e.code === 'ENOENT' || e.code === 'UNKNOWN')",
    ganti:
      "(e.code === 'EINVAL' || e.code === 'ENOENT' || e.code === 'UNKNOWN' || e.code === 'EISDIR')",
  },
  {
    path: "node_modules/next/dist/build/webpack/plugins/next-trace-entrypoints-plugin.js",
    cari: "(e.code === 'EINVAL' || e.code === 'ENOENT' || e.code === 'UNKNOWN')",
    ganti:
      "(e.code === 'EINVAL' || e.code === 'ENOENT' || e.code === 'UNKNOWN' || e.code === 'EISDIR')",
  },
  {
    path: "node_modules/next/dist/build/adapter/build-complete.js",
    cari: "if (e.code === 'EINVAL') {\n            // Not a symlink\n            hash.update('file:');\n            hash.update(await _promises.default.readFile(filePath));\n        } else {",
    ganti:
      "if (e.code === 'EINVAL' || e.code === 'EISDIR' || e.code === 'ENOENT') {\n            // Not a symlink (FAT32 dapat melempar EISDIR pada readlink)\n            hash.update('file:');\n            if (e.code !== 'EISDIR') {\n                hash.update(await _promises.default.readFile(filePath));\n            }\n        } else {",
  },
];

let diterapkan = 0;
for (const t of TARGETS) {
  try {
    const isi = readFileSync(t.path, "utf8");
    if (isi.includes(t.ganti)) {
      console.log(`OK (sudah ber-patch)  ${t.path}`);
      continue;
    }
    if (!isi.includes(t.cari)) {
      console.error(`SKIP (pola tidak ditemukan)  ${t.path}`);
      continue;
    }
    writeFileSync(t.path, isi.replace(t.cari, t.ganti));
    diterapkan += 1;
    console.log(`PATCHED  ${t.path}`);
  } catch (e) {
    console.error(`GAGAL  ${t.path}: ${e.message}`);
  }
}

console.log(
  diterapkan > 0
    ? `\n${diterapkan} patch diterapkan ke node_modules/next.`
    : "\nTidak ada patch baru (sudah selaras dengan target).",
);