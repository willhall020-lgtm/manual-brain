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
  const taskRows = (await db`
    SELECT id, section_id, name, urgency, custom_label, done_at, calendar_event_id, duration_minutes
    FROM tasks
    ORDER BY position ASC
  `) as {
    id: string;
    section_id: string;
    name: string;
    urgency: string;
    custom_label: string | null;
    done_at: string | null;
    calendar_event_id: string | null;
    duration_minutes: number | null;
  }[];

  const tasks: Task[] = taskRows.map((t) => ({
    id: t.id,
    sectionId: t.section_id,
    name: t.name,
    urgency: t.urgency as Task["urgency"],
    customLabel: t.custom_label,
    doneAt: t.done_at,
    calendarEventId: t.calendar_event_id,
    durationMinutes: t.duration_minutes,
  }));

  return { sections: sections.map((s) => ({ id: s.id, name: s.name })), tasks };
}
