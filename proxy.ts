import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

/**
 * Guards all /admin pages (except /admin/login) with the signed admin session.
 * API write routes are additionally protected with requireAdmin() inside each route.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const session = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
