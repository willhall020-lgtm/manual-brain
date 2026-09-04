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
    // Everything except the login page itself, its login API, the native
    // iOS app's Sign in with Apple API, static assets, and the cron
    // endpoint — those must stay reachable without a session cookie: the
    // first four to let someone establish a session at all (Apple's
    // identity token *is* that app's credential, so this route can't also
    // require the very session cookie it's meant to issue), the last
    // because Vercel's cron invocation carries no cookie, only its own
    // Authorization: Bearer CRON_SECRET (checked independently inside that
    // route, so this isn't opening it up unauthenticated).
    "/((?!login|api/auth/login|api/auth/apple|api/cron|_next/static|_next/image|favicon.ico).*)",
  ],
};
