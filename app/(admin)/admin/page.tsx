import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { amanAsync } from "@/lib/kueri-aman";

export const metadata: Metadata = { title: "Ringkasan Admin" };
export const dynamic = "force-dynamic";

const LABEL_AKSI: Record<string, string> = {
  "user.setujui_kader": "menyetujui pendaftaran",
  "user.tolak_kader": "menolak pendaftaran",
  "user.suspend": "menangguhkan akun",
  "user.aktivasi": "mengaktifkan akun",
  "user.hapus_permanen": "menghapus akun",
  "user.ubah_role": "mengubah peran",
  "artikel.create": "membuat artikel",
  "artikel.update": "memperbarui artikel",
  "artikel.terbitkan": "menerbitkan artikel",
  "artikel.arsip": "mengarsipkan artikel",
  "komentar.moderasi": "memoderasi komentar",
};

function labelAksi(aksi: string): string {
  return LABEL_AKSI[aksi] ?? aksi.replace(/\./g, " ");
}

/** Dashboard ringkasan admin: statistik + antrian moderasi + aktivitas terbaru. */
export default async function HalamanRingkasanAdmin() {
  const user = await requireRole("Super Admin", "Editor");

  const [statistik, antrian, aktivitas, gagalMemuat] = await amanAsync(
    () =>
      Promise.all([
        Promise.all([
          prisma.user.count({ where: { statusAkun: "AKTIF" } }),
          prisma.artikel.count(),
          prisma.user.count({ where: { statusAkun: "PENDING" } }),
          prisma.artikel.count({
            where: { status: { in: ["DIAJUKAN", "SEDANG_DITINJAU"] } },
          }),
          prisma.artikel.groupBy({ by: ["status"], _count: { _all: true } }),
        ]),
        prisma.artikel.findMany({
          where: { status: { in: ["DIAJUKAN", "SEDANG_DITINJAU"] } },
          orderBy: { tanggalDiajukan: "asc" },
          take: 6,
          select: {
            id: true,
            judul: true,
            status: true,
            tanggalDiajukan: true,
            penulis: { select: { namaLengkap: true } },
          },
        }),
        prisma.auditLog.findMany({
          orderBy: { tanggal: "desc" },
          take: 10,
          include: { aktor: { select: { namaLengkap: true, username: true } } },
        }),
        Promise.resolve(false),
      ]),
    [
      [0, 0, 0, 0, []],
      [],
      [],
      true,
    ],
  );

  const [totalKader, totalArtikel, totalMenunggu, perluModerasi, rincianStatus] = statistik;

  const kartu = [
    {
      label: "Total Kader Aktif",
      nilai: totalKader,
      href: "/admin/pengguna",
      aksen: false,
    },
    {
      label: "Antrean Pendaftaran",
      nilai: totalMenunggu,
      href: "/admin/pengguna",
      aksen: totalMenunggu > 0,
    },
    {
      label: "Perlu Moderasi",
      nilai: perluModerasi,
      href: "/admin/artikel?status=DIAJUKAN",
      aksen: perluModerasi > 0,
    },
    {
      label: "Total Artikel",
      nilai: totalArtikel,
      href: "/admin/artikel",
      aksen: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="border-b-2 border-hitam-900 pb-3">
        <h1 className="font-serif text-2xl font-extrabold text-hitam-900 md:text-3xl">
          Ringkasan Redaksi
        </h1>
        <p className="mt-1 text-sm text-hitam-500">
          Selamat datang, {user.name}. Pantau denyut nadi redaksi dari satu tempat.
        </p>
      </div>

      {gagalMemuat && (
        <p
          role="alert"
          className="mt-4 border-2 border-gmnimerah-500 bg-gmnimerah-50 px-4 py-2.5 text-sm font-semibold text-gmnimerah-700"
        >
          Data tidak dapat dimuat sementara — periksa koneksi database lalu
          muat ulang halaman.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={`block border-2 p-4 transition-colors hover:bg-kertas-100 ${
              k.aksen ? "border-gmnimerah-500" : "border-hitam-900"
            }`}
          >
            <p
              className={`font-mono text-[11px] font-bold uppercase tracking-widest ${
                k.aksen ? "text-gmnimerah-600" : "text-hitam-500"
              }`}
            >
              {k.label}
            </p>
            <p
              className={`mt-1 font-serif text-4xl font-extrabold ${
                k.aksen ? "text-gmnimerah-700" : "text-hitam-900"
              }`}
            >
              {k.nilai}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* BAGIAN-DUA: antrian moderasi */}
        <section aria-label="Antrian moderasi">
          <div className="flex items-baseline justify-between border-b-2 border-hitam-900 pb-2">
            <h2 className="font-serif text-xl font-extrabold text-hitam-900">
              Antrian Moderasi
            </h2>
            <Link
              href="/admin/artikel"
              className="font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-600 hover:text-gmnimerah-700"
            >
              Kelola Artikel →
            </Link>
          </div>
          {antrian.length === 0 ? (
            <div className="mt-4 border-2 border-dashed border-hitam-200 bg-kertas-100 p-6 text-center">
              <p className="text-sm text-hitam-500">
                Tidak ada artikel menunggu tinjauan. Redaksi aman.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {antrian.map((a) => (
                <li key={a.id} className="border border-hitam-200 bg-white p-3">
                  <p className="font-sans text-sm font-bold text-hitam-900">
                    <Link href={`/admin/artikel/${a.id}/edit`} className="hover:underline">
                      {a.judul}
                    </Link>
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-hitam-500">
                    {a.status === "DIAJUKAN" ? "Diajukan" : "Sedang Ditinjau"} ·{" "}
                    {a.penulis.namaLengkap}
                    {a.tanggalDiajukan &&
                      ` · ${a.tanggalDiajukan.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* BAGIAN-TIGA: aktivitas terbaru */}
        <section aria-label="Aktivitas terbaru">
          <div className="flex items-baseline justify-between border-b-2 border-hitam-900 pb-2">
            <h2 className="font-serif text-xl font-extrabold text-hitam-900">
              Aktivitas Terakhir
            </h2>
            <Link
              href="/admin/pengguna"
              className="font-mono text-[11px] font-bold uppercase tracking-widest text-gmnimerah-600 hover:text-gmnimerah-700"
            >
              Kelola Kader →
            </Link>
          </div>
          {aktivitas.length === 0 ? (
            <div className="mt-4 border-2 border-dashed border-hitam-200 bg-kertas-100 p-6 text-center">
              <p className="text-sm text-hitam-500">
                Belum ada aktivitas tercatat.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {aktivitas.map((log) => (
                <li key={log.id} className="border border-hitam-200 bg-white p-3">
                  <p className="text-sm text-hitam-700">
                    <strong className="text-hitam-900">
                      {log.aktor?.namaLengkap ?? "Sistem"}
                    </strong>{" "}
                    {labelAksi(log.aksi)}
                    <span className="text-hitam-500"> ({log.entitasTipe})</span>
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-hitam-400">
                    {log.tanggal.toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* BAGIAN-EMPAT: sebaran status */}
      {rincianStatus.length > 0 && (
        <section aria-label="Sebaran status artikel" className="mt-8">
          <h2 className="border-b-2 border-hitam-900 pb-2 font-serif text-xl font-extrabold text-hitam-900">
            Sebaran Status Artikel
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {rincianStatus.map((r) => (
              <Link
                key={r.status}
                href={`/admin/artikel?status=${r.status}`}
                className="border border-hitam-900 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700 transition-colors hover:bg-kertas-200"
              >
                {r.status.replace(/_/g, " ")} · {r._count._all}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
