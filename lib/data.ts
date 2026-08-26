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
    SELECT id, section_id, name, urgency, custom_label, done_at
    FROM tasks
    ORDER BY position ASC
  `) as {
    id: string;
    section_id: string;
    name: string;
    urgency: string;
    custom_label: string | null;
    done_at: string | null;
  }[];

  const tasks: Task[] = taskRows.map((t) => ({
    id: t.id,
    sectionId: t.section_id,
    name: t.name,
    urgency: t.urgency as Task["urgency"],
    customLabel: t.custom_label,
    doneAt: t.done_at,
  }));

  return { sections: sections.map((s) => ({ id: s.id, name: s.name })), tasks };
}
