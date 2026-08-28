import { sql } from "./db";

// OAuth (authorization code + refresh token) for writing to the user's
// Google Calendar — separate from the read-only iCal feed (lib/gcal.ts),
// which needs no OAuth at all. Single-user app: token pair lives in one
// row of the `google_auth` table (see lib/schema.sql).

export const GOOGLE_OAUTH_STATE_COOKIE = "mb_google_oauth_state";

const SCOPE = "https://www.googleapis.com/auth/calendar.events";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export function isGoogleOAuthConfigured(): boolean {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    // Forces Google to re-issue a refresh_token even if this user has
    // authorized before — without it a second connect can silently omit
    // refresh_token and the flow looks like it worked but isn't durable.
    prompt: "consent",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${await res.text()}`);
  }
  return res.json();
}

export async function saveTokens(refreshToken: string, accessToken: string, expiresInSec: number) {
  const db = sql();
  const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();
  await db`
    INSERT INTO google_auth (id, refresh_token, access_token, access_token_expires_at, updated_at)
    VALUES ('default', ${refreshToken}, ${accessToken}, ${expiresAt}, now())
    ON CONFLICT (id) DO UPDATE SET
      refresh_token = EXCLUDED.refresh_token,
      access_token = EXCLUDED.access_token,
      access_token_expires_at = EXCLUDED.access_token_expires_at,
      updated_at = now()
  `;
}

export async function isGoogleCalendarConnected(): Promise<boolean> {
  const db = sql();
  const rows = (await db`SELECT id FROM google_auth WHERE id = 'default'`) as { id: string }[];
  return rows.length > 0;
}

/** Returns a valid access token, refreshing it first if it's expired or
 * close to it. Throws if the calendar was never connected. */
export async function getValidAccessToken(): Promise<string> {
  const db = sql();
  const rows = (await db`
    SELECT refresh_token, access_token, access_token_expires_at
    FROM google_auth WHERE id = 'default'
  `) as { refresh_token: string; access_token: string | null; access_token_expires_at: string | null }[];

  const row = rows[0];
  if (!row) throw new Error("Google Calendar isn't connected yet.");

  const expiresAt = row.access_token_expires_at ? new Date(row.access_token_expires_at).getTime() : 0;
  const stillValid = row.access_token && expiresAt - Date.now() > 60_000; // 1 min buffer
  if (stillValid) return row.access_token!;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: row.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${await res.text()}`);
  }
  const data: TokenResponse = await res.json();
  await saveTokens(row.refresh_token, data.access_token, data.expires_in);
  return data.access_token;
}
