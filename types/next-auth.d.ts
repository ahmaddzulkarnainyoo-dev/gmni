import type { DefaultSession } from "next-auth";

/** Perluasan tipe sesi NextAuth dengan identitas & RBAC kader (blueprint Bagian 5). */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      roleId?: string;
      roleNama?: string;
      permissions?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    roleId?: string;
    roleNama?: string;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    roleId?: string;
    roleNama?: string;
    permissions?: string[];
  }
}