// Seeds the same starting content as the original design prototype, so a
// fresh database looks like the mockup on first load. Idempotent — does
// nothing if `sections` already has rows.
//
// Usage: npm run db:seed   (reads DATABASE_URL from .env.local)
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

// The old prototype seeded relative urgency buckets (Today / 2-3 days /
// etc.) — the app now uses real due dates, so this seeds actual dates
// computed from today instead. `null` (a handful of "This month"-ish and
// the one "Custom" item) is a genuine, common case: someday/backlog tasks
// with no firm date, not a placeholder for a missing value.
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SECTIONS = [
  {
    id: "s1",
    name: "Delight",
    tasks: [
      { name: "Book tickets for the Sunday film", dueDate: daysFromNow(0) },
      { name: "Plan Sam's birthday dinner", dueDate: daysFromNow(3) },
      { name: "Look up the pottery class", dueDate: null },
    ],
  },
  {
    id: "s2",
    name: "Work",
    tasks: [
      { name: "Send revised client deck to Priya", dueDate: daysFromNow(0) },
      { name: "Fix the numbers on slide 12", dueDate: daysFromNow(0) },
      { name: "Book a room for the Thursday workshop", dueDate: daysFromNow(6) },
      { name: "Draft Q4 resourcing note", dueDate: null },
      {
        name: "Post standup notes",
        dueDate: daysFromNow(0),
        done: true,
      },
    ],
  },
  {
    id: "s3",
    name: "Personal Project",
    tasks: [
      { name: "Wire up login on the side project", dueDate: daysFromNow(3) },
      { name: "Print the zine draft — before Sam visits", dueDate: null },
      { name: "Write up reading notes", dueDate: null },
    ],
  },
  {
    id: "s4",
    name: "Life",
    tasks: [
      { name: "Call the dentist back", dueDate: daysFromNow(0) },
      { name: "Cancel the gym trial", dueDate: daysFromNow(3) },
      { name: "Swap the winter clothes over", dueDate: null },
    ],
  },
  {
    id: "s5",
    name: "Admin",
    tasks: [
      { name: "Submit timesheet for last week", dueDate: daysFromNow(-1) },
      { name: "Renew car rego", dueDate: daysFromNow(6) },
      { name: "Chase the insurance refund", dueDate: null },
      {
        name: "Pay electricity bill",
        dueDate: daysFromNow(3),
        done: true,
      },
    ],
  },
];

const pool = new Pool({ connectionString: url });
try {
  const { rows } = await pool.query("SELECT count(*)::int AS n FROM sections");
  if (rows[0].n > 0) {
    console.log("sections already has data — skipping seed");
  } else {
    let taskN = 1;
    for (let i = 0; i < SECTIONS.length; i++) {
      const s = SECTIONS[i];
      await pool.query(
        "INSERT INTO sections (id, name, position) VALUES ($1, $2, $3)",
        [s.id, s.name, i]
      );
      for (let j = 0; j < s.tasks.length; j++) {
        const t = s.tasks[j];
        const id = "t" + taskN++;
        await pool.query(
          `INSERT INTO tasks (id, section_id, name, due_date, position, done_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id,
            s.id,
            t.name,
            t.dueDate,
            j,
            t.done ? new Date() : null,
          ]
        );
      }
    }
    console.log("✓ seeded", SECTIONS.length, "sections");
  }
} catch (err) {
  console.error("Seed failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
