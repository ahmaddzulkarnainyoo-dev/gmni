import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

const ROLES_ADMIN = ["Super Admin", "Editor"];
const TIPE_DITERIMA = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAKS_BYTE = 5 * 1024 * 1024;

/**
 * POST /api/media — unggah gambar unggulan ke Supabase Storage.
 * Disusun tanpa dependensi eksternal (REST API storage). Jika bucket/policy
 * belum siap, gunakan fallback URL gambar manual di form.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Harus masuk terlebih dahulu." }, { status: 401 });
  }
  if (!user.roleNama || !ROLES_ADMIN.includes(user.roleNama)) {
    return NextResponse.json(
      { error: "Hanya Super Admin atau Editor yang dapat mengunggah media." },
      { status: 403 },
    );
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supaUrl || !anon) {
    return NextResponse.json(
      { error: "Storage belum dikonfigurasi (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)." },
      { status: 501 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "File gambar wajib diunggah." }, { status: 400 });
    }
    if (!TIPE_DITERIMA.has(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan PNG/JPEG/WebP/GIF." },
        { status: 400 },
      );
    }
    if (file.size > MAKS_BYTE) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB." }, { status: 400 });
    }

    const ekstensi =
      file.type === "image/png"
        ? "png"
        : file.type === "image/jpeg"
          ? "jpg"
          : file.type === "image/webp"
            ? "webp"
            : "gif";
    const nama = `artikel/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ekstensi}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "artikel";

    const bytes = Buffer.from(await file.arrayBuffer());
    const res = await fetch(`${supaUrl}/storage/v1/object/${bucket}/${nama}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anon}`,
        apikey: anon,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: bytes,
    });

    if (!res.ok) {
      const keterangan = await res.text().catch(() => "");
      console.error("[media] Upload Supabase gagal:", res.status, keterangan.slice(0, 300));
      return NextResponse.json(
        {
          error:
            "Upload gagal. Pastikan bucket & policy storage sudah dikonfigurasi, atau masukkan URL gambar manual.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      url: `${supaUrl}/storage/v1/object/public/${bucket}/${nama}`,
    });
  } catch (error) {
    console.error("[media] Error unggah:", error);
    return NextResponse.json({ error: "Gagal mengunggah gambar." }, { status: 500 });
  }
}