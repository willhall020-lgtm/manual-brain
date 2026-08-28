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

const SECTIONS = [
  {
    id: "s1",
    name: "Delight",
    tasks: [
      { name: "Book tickets for the Sunday film", urgency: "Today" },
      { name: "Plan Sam's birthday dinner", urgency: "2–3 days" },
      { name: "Look up the pottery class", urgency: "This month" },
    ],
  },
  {
    id: "s2",
    name: "Work",
    tasks: [
      { name: "Send revised client deck to Priya", urgency: "Today" },
      { name: "Fix the numbers on slide 12", urgency: "Today" },
      {
        name: "Book a room for the Thursday workshop",
        urgency: "End of this week",
      },
      { name: "Draft Q4 resourcing note", urgency: "This month" },
      {
        name: "Post standup notes",
        urgency: "Today",
        done: true,
      },
    ],
  },
  {
    id: "s3",
    name: "Personal Project",
    tasks: [
      { name: "Wire up login on the side project", urgency: "2–3 days" },
      {
        name: "Print the zine draft",
        urgency: "Custom",
        customLabel: "before Sam visits",
      },
      { name: "Write up reading notes", urgency: "This month" },
    ],
  },
  {
    id: "s4",
    name: "Life",
    tasks: [
      { name: "Call the dentist back", urgency: "Today" },
      { name: "Cancel the gym trial", urgency: "2–3 days" },
      { name: "Swap the winter clothes over", urgency: "This month" },
    ],
  },
  {
    id: "s5",
    name: "Admin",
    tasks: [
      { name: "Submit timesheet for last week", urgency: "2–3 days" },
      { name: "Renew car rego", urgency: "End of this week" },
      { name: "Chase the insurance refund", urgency: "This month" },
      {
        name: "Pay electricity bill",
        urgency: "2–3 days",
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
          `INSERT INTO tasks (id, section_id, name, urgency, custom_label, position, done_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id,
            s.id,
            t.name,
            t.urgency,
            t.customLabel ?? null,
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
