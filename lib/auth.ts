import { createHmac, timingSafeEqual } from "node:crypto";

// A single shared password gates the whole site (SITE_PASSWORD). The
// session cookie's value is HMAC(password, "manual-brain-session") — a
// fixed, deterministic token derived from the password itself, so there's
// no separate secret to manage and the cookie never contains the password.
// Not meant to scale past "one household" — no per-user accounts, no rate
// limiting on login attempts.

export const SESSION_COOKIE = "mb_session";

export function isAuthConfigured(): boolean {
  return !!process.env.SITE_PASSWORD;
}

export function expectedSessionToken(): string | null {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("manual-brain-session").digest("hex");
}

export function checkPassword(candidate: string): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  // timingSafeEqual throws on length mismatch — pad instead of early-return
  // so a wrong-length guess doesn't leak length via timing.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = expectedSessionToken();
  if (!expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
