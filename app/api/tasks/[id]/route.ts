import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isDueDateString } from "@/lib/due-date";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const db = sql();

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      }
      await db`UPDATE tasks SET name = ${name} WHERE id = ${id}`;
    }

    if (body?.dueDate !== undefined) {
      // null explicitly clears the due date; anything else that isn't a
      // valid "YYYY-MM-DD" is rejected rather than silently ignored here —
      // unlike creation, an edit is a deliberate single-field action, so a
      // bad value is more likely a real bug worth surfacing than noise.
      if (body.dueDate !== null && !isDueDateString(body.dueDate)) {
        return NextResponse.json({ error: "dueDate must be YYYY-MM-DD or null" }, { status: 400 });
      }
      await db`UPDATE tasks SET due_date = ${body.dueDate} WHERE id = ${id}`;
    }

    if (typeof body?.done === "boolean") {
      await db`
        UPDATE tasks SET done_at = ${body.done ? new Date().toISOString() : null}
        WHERE id = ${id}
      `;
    }

    if (body?.durationMinutes !== undefined) {
      const durationMinutes =
        typeof body.durationMinutes === "number" &&
        Number.isFinite(body.durationMinutes) &&
        body.durationMinutes > 0
          ? Math.round(body.durationMinutes)
          : null;
      await db`UPDATE tasks SET duration_minutes = ${durationMinutes} WHERE id = ${id}`;
    }

    // due_date::text — see lib/data.ts's getState() for why: the neon()
    // client turns a bare `date` column into a JS Date and shifts it by
    // the local UTC offset in the process, corrupting the calendar day.
    const rows = (await db`
      SELECT id, section_id, name, due_date::text AS due_date, done_at, duration_minutes
      FROM tasks WHERE id = ${id}
    `) as {
      id: string;
      section_id: string;
      name: string;
      due_date: string | null;
      done_at: string | null;
      duration_minutes: number | null;
    }[];

    if (!rows.length) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const t = rows[0];
    return NextResponse.json({
      id: t.id,
      sectionId: t.section_id,
      name: t.name,
      dueDate: t.due_date,
      doneAt: t.done_at,
      durationMinutes: t.duration_minutes,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to update the task.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = sql();
    await db`DELETE FROM tasks WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to delete the task.",
      },
      { status: 500 }
    );
  }
}
