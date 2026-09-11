"use client";

import { useState } from "react";

type RoleData = {
  id: string;
  nama: string;
  deskripsi: string | null;
  isSystemDefault: boolean;
  permissionKodes: string[];
};
type PermissionData = { kode: string; deskripsi: string | null };

/** Pengelola RBAC tanpa kode — Super Admin mengatur izin per role. */
export function PengelolaRole({
  roles,
  permissions,
}: {
  roles: RoleData[];
  permissions: PermissionData[];
}) {
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const role = roles.find((r) => r.id === roleId) ?? roles[0];
  const [pilih, setPilih] = useState<string[]>(role?.permissionKodes ?? []);
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [eror, setEror] = useState<string | null>(null);

  function gantiRole(id: string) {
    const r = roles.find((x) => x.id === id);
    setRoleId(id);
    setPilih(r?.permissionKodes ?? []);
    setPesan(null);
    setEror(null);
  }

  function toggle(kode: string) {
    setPilih((p) => (p.includes(kode) ? p.filter((k) => k !== kode) : [...p, kode]));
  }

  async function simpan() {
    if (!role) return;
    setMemuat(true);
    setPesan(null);
    setEror(null);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionKodes: pilih }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal menyimpan izin role.");
        return;
      }
      setPesan(`Izin role ${role.nama} berhasil diperbarui.`);
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Daftar role */}
      <div>
        <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Pilih Role
        </p>
        <nav className="flex flex-col gap-1">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => gantiRole(r.id)}
              className={`border-l-4 px-3 py-2.5 text-left transition-colors ${
                r.id === roleId
                  ? "border-gmnimerah-500 bg-kertas-200"
                  : "border-transparent hover:bg-kertas-200"
              }`}
            >
              <span className="block font-sans text-sm font-bold text-hitam-900">
                {r.nama}
              </span>
              <span className="block text-xs text-hitam-500">
                {r.isSystemDefault ? "Role bawaan" : "Role kustom"}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {role ? (
        <div className="border-2 border-hitam-900 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-hitam-900 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-hitam-900">
                {role.nama}
              </h2>
              {role.deskripsi && (
                <p className="mt-1 max-w-xl text-sm text-hitam-500">{role.deskripsi}</p>
              )}
            </div>
            <span className="border border-hitam-900 bg-kertas-200 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-700">
              {pilih.length} dari {permissions.length} izin
            </span>
          </div>

          {pesan && (
            <p
              role="status"
              className="mt-3 border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800"
            >
              {pesan}
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

          <ul className="mt-4 grid gap-1.5 md:grid-cols-2">
            {permissions.map((p) => {
              const aktif = pilih.includes(p.kode);
              return (
                <li key={p.kode}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 border p-2.5 transition-colors ${
                      aktif
                        ? "border-gmnimerah-500 bg-gmnimerah-50"
                        : "border-hitam-200 bg-white hover:border-hitam-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={aktif}
                      onChange={() => toggle(p.kode)}
                      className="mt-0.5 accent-gmnimerah-500"
                    />
                    <span>
                      <span className="block font-mono text-[12px] font-bold text-hitam-900">
                        {p.kode}
                      </span>
                      {p.deskripsi && (
                        <span className="block text-xs text-hitam-500">{p.deskripsi}</span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 border-t-2 border-hitam-200 pt-4">
            <button
              type="button"
              onClick={simpan}
              disabled={memuat}
              className="bg-gmnimerah-500 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gmnimerah-600 disabled:opacity-50"
            >
              {memuat ? "Menyimpan..." : "Simpan Perubahan Izin"}
            </button>
            {role.isSystemDefault && (
              <p className="mt-2 text-xs text-hitam-400">
                Role bawaan tidak dapat dihapus, tetapi daftar izinnya dapat
                disesuaikan (blueprint 5.2).
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-hitam-500">Belum ada role.</p>
      )}
    </div>
  );
}