import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { buildAuthUrl, GOOGLE_OAUTH_STATE_COOKIE, isGoogleOAuthConfigured } from "@/lib/google-auth";

// Kicks off the Google Calendar write-access OAuth flow. Gated behind the
// site's own password (proxy.ts) already, so no extra auth check here.

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set." },
      { status: 500 }
    );
  }

  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();
  const state = randomBytes(16).toString("hex");

  const res = NextResponse.redirect(buildAuthUrl(redirectUri, state));
  res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 min, just long enough for the consent screen
  });
  return res;
}
