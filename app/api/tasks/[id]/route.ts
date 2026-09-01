import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isDueDateString } from "@/lib/due-date";
import { isTimeOfDay } from "@/lib/time-of-day";
import { advanceDueDate, isRepeatFrequency } from "@/lib/repeat";
import { deleteCalendarEvent } from "@/lib/google-calendar";

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

      const [before] = (await db`
        SELECT due_date::text AS due_date, calendar_event_id FROM tasks WHERE id = ${id}
      `) as { due_date: string | null; calendar_event_id: string | null }[];

      await db`UPDATE tasks SET due_date = ${body.dueDate} WHERE id = ${id}`;
      // A repeat rule only makes sense alongside a due date — clearing the
      // date clears any repeat rule with it rather than leaving it orphaned.
      if (body.dueDate === null) {
        await db`UPDATE tasks SET repeat_frequency = NULL WHERE id = ${id}`;
      }

      // A booked task moving to a different day invalidates its old slot —
      // the calendar event is still sitting on the old date/time, and
      // worse, a task that still looks "scheduled" (calendar_event_id set)
      // gets silently skipped by the next booking run (list_tasks reports
      // it as already scheduled; both the cron prompt and schedule_task's
      // own instructions say to skip those) — so it would never get
      // rebooked for its new date on its own. Unschedule it here instead:
      // best-effort delete the stale event (failure isn't worth blocking
      // the date change over — worst case a stray event needs manual
      // cleanup), then always clear calendar_event_id so the task is
      // picked up fresh next time something books it.
      if (before?.calendar_event_id && before.due_date !== body.dueDate) {
        try {
          await deleteCalendarEvent(before.calendar_event_id);
        } catch (err) {
          console.error("Failed to delete stale calendar event while unscheduling:", err);
        }
        await db`UPDATE tasks SET calendar_event_id = NULL WHERE id = ${id}`;
      }
    }

    if (body?.repeatFrequency !== undefined) {
      // null explicitly clears the repeat rule; anything else that isn't a
      // real frequency is rejected — same reasoning as dueDate/timeOfDay
      // above: a deliberate edit deserves a 400, unlike creation's
      // silent-ignore.
      if (body.repeatFrequency !== null && !isRepeatFrequency(body.repeatFrequency)) {
        return NextResponse.json(
          { error: "repeatFrequency must be 'daily', 'weekly', 'monthly', or null" },
          { status: 400 }
        );
      }
      await db`UPDATE tasks SET repeat_frequency = ${body.repeatFrequency} WHERE id = ${id}`;
    }

    if (typeof body?.done === "boolean") {
      if (body.done) {
        // A repeating task doesn't move into the Done panel — completing
        // it rolls due_date forward to its next occurrence and stays
        // active instead, same pattern as Things/Todoist. Only a task
        // that has both a due date and a repeat rule qualifies; anything
        // else completes normally.
        const [current] = (await db`
          SELECT due_date::text AS due_date, repeat_frequency FROM tasks WHERE id = ${id}
        `) as { due_date: string | null; repeat_frequency: string | null }[];

        if (current?.due_date && isRepeatFrequency(current.repeat_frequency)) {
          const nextDueDate = advanceDueDate(current.due_date, current.repeat_frequency);
          await db`UPDATE tasks SET due_date = ${nextDueDate}, done_at = NULL WHERE id = ${id}`;
        } else {
          await db`UPDATE tasks SET done_at = ${new Date().toISOString()} WHERE id = ${id}`;
        }
      } else {
        await db`UPDATE tasks SET done_at = NULL WHERE id = ${id}`;
      }
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

    if (body?.timeOfDay !== undefined) {
      // null explicitly clears the preference; anything else that isn't a
      // real TimeOfDay value is rejected — same reasoning as dueDate above:
      // a deliberate edit deserves a 400, unlike creation's silent-ignore.
      if (body.timeOfDay !== null && !isTimeOfDay(body.timeOfDay)) {
        return NextResponse.json(
          { error: "timeOfDay must be 'morning', 'afternoon', 'evening', or null" },
          { status: 400 }
        );
      }
      await db`UPDATE tasks SET time_of_day = ${body.timeOfDay} WHERE id = ${id}`;
    }

    // due_date::text — see lib/data.ts's getState() for why: the neon()
    // client turns a bare `date` column into a JS Date and shifts it by
    // the local UTC offset in the process, corrupting the calendar day.
    const rows = (await db`
      SELECT id, section_id, name, due_date::text AS due_date, done_at, calendar_event_id, duration_minutes, time_of_day, repeat_frequency
      FROM tasks WHERE id = ${id}
    `) as {
      id: string;
      section_id: string;
      name: string;
      due_date: string | null;
      done_at: string | null;
      calendar_event_id: string | null;
      duration_minutes: number | null;
      time_of_day: string | null;
      repeat_frequency: string | null;
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
      calendarEventId: t.calendar_event_id,
      durationMinutes: t.duration_minutes,
      timeOfDay: isTimeOfDay(t.time_of_day) ? t.time_of_day : null,
      repeatFrequency: isRepeatFrequency(t.repeat_frequency) ? t.repeat_frequency : null,
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
