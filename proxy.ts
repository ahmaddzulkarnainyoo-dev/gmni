import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { bolehMasukAdmin } from "@/lib/nav";

/**
 * Proxy (pengganti middleware.ts di Next.js 16 — lihat note di node_modules/next/dist/docs).
 * Proteksi rute berlapis di edge: /admin/* & /dasbor/*.
 * Lapisan server-side tetap ada di app/(admin)/layout.tsx & app/(dasbor)/layout.tsx.
 */

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "info-marhaen-dev-secret";
  const token = await getToken({ req: request, secret });

  // /admin/* — wajib login + role Super Admin / Editor.
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    const roleNama = token.roleNama as string | undefined;
    if (!bolehMasukAdmin(roleNama)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // /dasbor/* — wajib sudah login (kader terverifikasi).
  if (pathname.startsWith("/dasbor")) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // :path* juga mencakup /admin dan /dasbor itu sendiri.
  matcher: ["/admin/:path*", "/dasbor/:path*"],
};