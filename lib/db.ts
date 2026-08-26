import { neon } from "@neondatabase/serverless";

// Lazily create the Neon client so `next build` (and any module that just
// imports this file) never crashes when DATABASE_URL isn't set yet — the
// error only surfaces when a route actually tries to touch the database.
let cached: ReturnType<typeof neon> | null = null;

export function sql() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local (see .env.example) or, on Vercel, to the project's Environment Variables."
    );
  }
  cached = neon(url);
  return cached;
}
