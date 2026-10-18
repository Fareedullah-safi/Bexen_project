import { NextResponse } from "next/server";
import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow the login page to load without authentication.
  if (pathname === "/adminLogin") {
    const session = await getAdminSession();

    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // Protect admin pages.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.redirect(new URL("/adminLogin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/adminLogin"],
};
