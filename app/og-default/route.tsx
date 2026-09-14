import { ImageResponse } from "next/og";

/**
 * OG image default (Sub-Fase 4.2): fallback untuk semua halaman tanpa
 * gambar — 1200x630, tema pers GMNI (hitam + merah + serif).
 */


export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 72px",
          background: "#141210",
          border: "16px solid #c8102e",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            color: "#c8102e",
            fontWeight: 700,
          }}
        >
          PORTAL BERITA &amp; SUARA MARHAENISME
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 110,
            fontWeight: 800,
            color: "#faf7f0",
            lineHeight: 1,
          }}
        >
          info Marhaen
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 30,
            color: "#d8d2c4",
          }}
        >
          Ditulis kader terverifikasi, dikurasi redaksi.
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
