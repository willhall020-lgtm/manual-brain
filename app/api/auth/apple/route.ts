import { NextResponse } from "next/server";
import {
  claimOwnerIfNoneExists,
  getOwner,
  isAppleSignInConfigured,
  verifyAppleIdentityToken,
} from "@/lib/apple-auth";
import { expectedSessionToken, isAuthConfigured, SESSION_COOKIE } from "@/lib/auth";

// Sign in with Apple, native-iOS flavor: the client (ios/) already holds a
// signed identity token from AuthenticationServices — this just verifies
// it, decides whether the Apple account behind it is this deploy's one
// linked owner (claiming that slot on the very first sign-in anyone ever
// completes), and on success sets the exact same session cookie the
// password login flow sets (app/api/auth/login/route.ts). proxy.ts needs
// no changes at all: the real access decision already happened above, by
// the time this cookie gets set it's just this deploy's existing session
// format, reused rather than duplicated.

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAppleSignInConfigured()) {
    return NextResponse.json(
      { error: "Sign in with Apple is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const identityToken = typeof body?.identityToken === "string" ? body.identityToken : "";
  if (!identityToken) {
    return NextResponse.json({ error: "identityToken is required." }, { status: 400 });
  }

  let identity;
  try {
    identity = await verifyAppleIdentityToken(identityToken);
  } catch (err) {
    console.error("Apple identity token verification failed:", err);
    return NextResponse.json({ error: "Couldn't verify that Apple sign-in." }, { status: 401 });
  }

  await claimOwnerIfNoneExists(identity.sub, identity.email);
  const owner = await getOwner();

  if (!owner || owner.id !== identity.sub) {
    return NextResponse.json(
      { error: "This app is already linked to a different Apple account." },
      { status: 403 }
    );
  }

  const res = NextResponse.json({ ok: true, email: owner.email });

  // SITE_PASSWORD unset means proxy.ts's gate is already a no-op (open
  // site) — nothing to set a session for in that case, same as the
  // password login route would have nothing to check against either.
  if (isAuthConfigured()) {
    res.cookies.set(SESSION_COOKIE, expectedSessionToken()!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // 180 days — matches the password flow
    });
  }
  return res;
}
