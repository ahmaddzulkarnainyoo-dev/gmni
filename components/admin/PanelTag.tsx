"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";

type TagData = { id: string; nama: string; slug: string; jumlahArtikel: number };

/** CRUD tag untuk admin (Super Admin/Editor). */
export function PanelTag({ tags }: { tags: TagData[] }) {
  const [nama, setNama] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [eror, setEror] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editSlug, setEditSlug] = useState("");

  function mulaiEdit(t: TagData) {
    setEditId(t.id);
    setEditNama(t.nama);
    setEditSlug(t.slug);
    setEror(null);
  }

  async function buat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setEror(null);
    setPesan(null);
    try {
      const res = await fetch("/api/admin/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, slug: slugify(nama) }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal membuat tag.");
        return;
      }
      setPesan(`Tag "${nama}" dibuat.`);
      setNama("");
      window.location.reload();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  async function simpanEdit(t: TagData) {
    setMemuat(true);
    setEror(null);
    setPesan(null);
    try {
      const res = await fetch(`/api/admin/tag/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: editNama, slug: editSlug }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setEror(data.error ?? "Gagal menyimpan tag.");
        return;
      }
      window.location.reload();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  async function hapus(t: TagData) {
    if (!confirm(`Hapus tag "${t.nama}"?`)) return;
    setMemuat(true);
    setEror(null);
    try {
      const res = await fetch(`/api/admin/tag/${t.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEror(data.error ?? "Gagal menghapus tag.");
        return;
      }
      window.location.reload();
    } catch {
      setEror("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={buat} className="border-2 border-hitam-900 bg-kertas-100 p-4">
        <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-widest text-hitam-600">
          Tag Baru
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            required
            minLength={2}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama tag"
            className="min-w-[200px] flex-1 border-2 border-hitam-900 bg-white px-3 py-2 text-sm text-hitam-900 outline-none focus:border-gmnimerah-500"
          />
          <button
            type="submit"
            disabled={memuat}
            className="bg-gmnimerah-500 px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-white hover:bg-gmnimerah-600 disabled:opacity-50"
          >
            Tambah
          </button>
        </div>
        <p className="mt-2 text-xs text-hitam-400">Slug dibuat otomatis dari nama.</p>
      </form>

      {pesan && (
        <p role="status" className="border-2 border-hitam-900 bg-kertas-200 px-3 py-2 text-sm font-semibold text-hitam-800">
          {pesan}
        </p>
      )}
      {eror && (
        <p role="alert" className="border-2 border-gmnimerah-500 bg-gmnimerah-50 px-3 py-2 text-sm font-semibold text-gmnimerah-700">
          {eror}
        </p>
      )}

      <div className="overflow-x-auto border-2 border-hitam-900 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-hitam-900 bg-kertas-200 font-mono text-[11px] uppercase tracking-widest text-hitam-600">
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Artikel</th>
              <th className="px-3 py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) =>
              editId === t.id ? (
                <tr key={t.id} className="border-b border-hitam-100 bg-kertas-100">
                  <td colSpan={4} className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={editNama}
                        onChange={(e) => setEditNama(e.target.value)}
                        className="min-w-[160px] flex-1 border-2 border-hitam-900 bg-white px-2 py-1 text-sm"
                      />
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="min-w-[140px] border-2 border-hitam-900 bg-white px-2 py-1 font-mono text-xs"
                      />
                      <button
                        type="button"
                        disabled={memuat}
                        onClick={() => simpanEdit(t)}
                        className="bg-hitam-900 px-3 py-1 font-mono text-[11px] font-bold uppercase text-white disabled:opacity-50"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="border border-hitam-300 px-2 py-1 font-mono text-[11px] text-hitam-500"
                      >
                        Batal
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={t.id} className="border-b border-hitam-100 hover:bg-kertas-100">
                  <td className="px-3 py-2.5 font-sans text-sm font-bold text-hitam-900">{t.nama}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-hitam-600">/{t.slug}</td>
                  <td className="px-3 py-2.5 text-hitam-700">{t.jumlahArtikel}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => mulaiEdit(t)}
                        className="border border-hitam-900 px-2 py-1 font-mono text-[10px] font-bold uppercase text-hitam-900 hover:bg-kertas-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(t)}
                        className="border border-gmnimerah-700 px-2 py-1 font-mono text-[10px] font-bold uppercase text-gmnimerah-700 hover:bg-gmnimerah-700 hover:text-white"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {tags.length === 0 && <p className="p-6 text-sm text-hitam-500">Belum ada tag.</p>}
      </div>
    </div>
  );
}