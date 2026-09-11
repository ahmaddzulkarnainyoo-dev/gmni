import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Bantuan RBAC sisi server (blueprint Bagian 5):
 * - getSessionUser: mengambil pengguna sesi (nullable).
 * - requireAuthUser: memaksa sudah login; jika tidak, redirect ke /login.
 * - requirePermission: memaksa login + memiliki minimal satu dari kode
 *   permission yang diminta; jika tidak, redirect ke /login (belum login)
 *   atau / (tidak punya hak).
 */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  roleId?: string;
  roleNama?: string;
  permissions: string[];
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const sess = await getServerSession(authOptions);
  const u = sess?.user;
  if (!u?.id) return null;
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    username: u.username,
    roleId: u.roleId,
    roleNama: u.roleNama,
    permissions: u.permissions ?? [],
  };
}

export async function requireAuthUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(...kode: string[]): Promise<SessionUser> {
  const user = await requireAuthUser();
  const punya = user.permissions.some((p) => kode.includes(p));
  if (!punya) redirect("/");
  return user;
}