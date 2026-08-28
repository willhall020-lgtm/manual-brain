import { sql } from "./db";
import type { Section, Task } from "./types";

/** Shared by the initial server-rendered load (app/page.tsx) and the
 * client's error-recovery refetch (GET /api/state) so both read the
 * database the same way. */
export async function getState(): Promise<{ sections: Section[]; tasks: Task[] }> {
  const db = sql();
  const sections = (await db`
    SELECT id, name FROM sections ORDER BY position ASC
  `) as { id: string; name: string }[];
  // due_date::text: the neon() HTTP client parses a bare `date` column into
  // a JS Date client-side (unlike text/timestamptz, which come back as
  // plain strings) — and doing that shifts it by the local UTC offset,
  // corrupting the calendar day itself, not just the format. Casting in
  // SQL sidesteps that entirely: Postgres hands back the literal
  // "YYYY-MM-DD" text, no Date object ever constructed.
  const taskRows = (await db`
    SELECT id, section_id, name, due_date::text AS due_date, done_at, calendar_event_id, duration_minutes
    FROM tasks
    ORDER BY position ASC
  `) as {
    id: string;
    section_id: string;
    name: string;
    due_date: string | null;
    done_at: string | null;
    calendar_event_id: string | null;
    duration_minutes: number | null;
  }[];

  const tasks: Task[] = taskRows.map((t) => ({
    id: t.id,
    sectionId: t.section_id,
    name: t.name,
    dueDate: t.due_date,
    doneAt: t.done_at,
    calendarEventId: t.calendar_event_id,
    durationMinutes: t.duration_minutes,
  }));

  return { sections: sections.map((s) => ({ id: s.id, name: s.name })), tasks };
}
