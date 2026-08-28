import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthConfigured, isValidSessionToken, SESSION_COOKIE } from "@/lib/auth";

// Single shared-password gate for the whole site — see lib/auth.ts. If
// SITE_PASSWORD isn't set, the gate is a no-op (matches how DATABASE_URL
// unset just shows an error card rather than hard-failing every route).
export function proxy(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (isValidSessionToken(token)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Everything except the login page itself, its login API, and static
    // assets — those must stay reachable to log in at all.
    "/((?!login|api/auth/login|_next/static|_next/image|favicon.ico).*)",
  ],
};
