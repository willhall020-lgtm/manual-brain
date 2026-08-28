import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GOOGLE_OAUTH_STATE_COOKIE, exchangeCodeForTokens, saveTokens } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const expectedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  const settingsUrl = new URL("/settings", url.origin);
  const res = () => {
    const r = NextResponse.redirect(settingsUrl);
    r.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    return r;
  };

  if (error) {
    settingsUrl.searchParams.set("google_error", error);
    return res();
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    settingsUrl.searchParams.set("google_error", "invalid_state");
    return res();
  }

  const redirectUri = new URL("/api/auth/google/callback", url.origin).toString();

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    if (!tokens.refresh_token) {
      // Happens if the user had already granted consent before and Google
      // didn't re-issue one — prompt=consent on /start should prevent
      // this, but guard anyway rather than silently storing nothing.
      settingsUrl.searchParams.set("google_error", "no_refresh_token");
      return res();
    }
    await saveTokens(tokens.refresh_token, tokens.access_token, tokens.expires_in);
    settingsUrl.searchParams.set("google_connected", "1");
  } catch (err) {
    settingsUrl.searchParams.set(
      "google_error",
      err instanceof Error ? err.message.slice(0, 200) : "unknown_error"
    );
  }

  return res();
}
