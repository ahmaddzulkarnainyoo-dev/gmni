import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Konfigurasi NextAuth/Auth.js info Marhaen.
 *
 * Strategi: Credentials (email + sandi) + sesi JWT. Pengguna divalidasi
 * langsung terhadap tabel User (Prisma), sandi dicek dengan bcryptjs.
 * Informasi role + permission disematkan ke token JWT agar RBAC
 * (blueprint Bagian 5) bisa dijalankan di server tanpa query DB berulang.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret:
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "info-marhaen-dev-secret",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Kredensial Kader",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Sandi", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const sandi = credentials?.password;
        if (!email || !sandi) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
          },
        });
        if (!user || user.statusAkun !== "AKTIF") return null;

        const cocok = await compare(sandi, user.passwordHash);
        if (!cocok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.namaLengkap,
          username: user.username,
          roleId: user.roleId,
          roleNama: user.role.nama,
          permissions: user.role.permissions.map((rp) => rp.permission.kode),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.roleId = user.roleId;
        token.roleNama = user.roleNama;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.username = token.username;
        session.user.roleId = token.roleId;
        session.user.roleNama = token.roleNama;
        session.user.permissions = token.permissions ?? [];
      }
      return session;
    },
  },
};