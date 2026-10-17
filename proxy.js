import { NextResponse } from "next/server";
import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const session = await getAdminSession();

  // Protect admin pages.
  if (pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/adminLogin", request.url));
  }

  // Redirect logged-in admins away from the login page.
  if (pathname === "/adminLogin" && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/adminLogin"],
};
