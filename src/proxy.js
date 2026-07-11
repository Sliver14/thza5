import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protect admin dashboard
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect member dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!session || session.user.role !== 'MEMBER') {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
