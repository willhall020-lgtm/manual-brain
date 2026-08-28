// Applies lib/schema.sql to DATABASE_URL. Safe to re-run (uses IF NOT
// EXISTS throughout).
//
// Usage: npm run db:migrate   (reads DATABASE_URL from .env.local)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Node <22 has no global WebSocket — the Pool driver needs one to open its
// connection. Not needed by the app itself (lib/db.ts uses the HTTP-based
// `neon()` client), only by these one-off scripts.
neonConfig.webSocketConstructor = ws;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill in your Neon connection string first."
  );
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(path.join(here, "..", "lib", "schema.sql"), "utf8");

const pool = new Pool({ connectionString: url });
try {
  await pool.query(schema);
  console.log("✓ schema applied");
} catch (err) {
  console.error("Migration failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
