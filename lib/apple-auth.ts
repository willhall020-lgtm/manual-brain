import { createRemoteJWKSet, jwtVerify } from "jose";
import { sql } from "./db";

// Verifies a Sign in with Apple identity token from the iOS app's native
// AuthenticationServices flow, and tracks the single Apple account this
// deploy is linked to (see schema.sql's `users` table comment for why
// that's a one-row onboarding claim, not a per-user account system).
//
// This is deliberately NOT the "Sign in with Apple JS" web flow, which
// exchanges an authorization code for tokens server-side and needs a
// Services ID, a verified domain, and a private key to sign a client
// secret with. The native flow already hands the client a signed identity
// token directly — verifying its signature against Apple's own public
// JWKS is enough to trust `sub` (a stable per-app user id) and `email`,
// with no private key material needed on this server at all.

const APPLE_ISSUER = "https://appleid.apple.com";
const jwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export interface AppleIdentity {
  sub: string;
  email: string | null;
}

export interface Owner {
  id: string;
  email: string | null;
}

export function isAppleSignInConfigured(): boolean {
  return !!process.env.APPLE_APP_BUNDLE_ID;
}

/** Verifies the token's signature, issuer and audience (this app's bundle
 * id) via Apple's published JWKS. Throws on anything invalid or expired —
 * callers treat that as "reject the sign-in", never as "trust it anyway". */
export async function verifyAppleIdentityToken(identityToken: string): Promise<AppleIdentity> {
  const bundleId = process.env.APPLE_APP_BUNDLE_ID;
  if (!bundleId) {
    throw new Error("APPLE_APP_BUNDLE_ID is not set on the server.");
  }
  const { payload } = await jwtVerify(identityToken, jwks, {
    issuer: APPLE_ISSUER,
    audience: bundleId,
  });
  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Apple identity token has no subject.");
  }
  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
  };
}

/** The app's one linked owner, or null if nobody has completed onboarding
 * (Sign in with Apple) yet. */
export async function getOwner(): Promise<Owner | null> {
  const db = sql();
  const rows = (await db`SELECT id, email FROM users LIMIT 1`) as Owner[];
  return rows[0] ?? null;
}

/** Onboarding: claims ownership for `id` only if this deploy has no owner
 * yet — the `WHERE NOT EXISTS` makes the insert a no-op (not an error)
 * both when this same id already owns it and, more importantly, when a
 * *different* id already does; the route handler is what actually rejects
 * a second, different Apple account afterward by re-reading getOwner()
 * and comparing. */
export async function claimOwnerIfNoneExists(id: string, email: string | null): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO users (id, email)
    SELECT ${id}, ${email}
    WHERE NOT EXISTS (SELECT 1 FROM users)
    ON CONFLICT (id) DO NOTHING
  `;
}
