import { NextResponse } from "next/server";
import type { MessageParam, TextBlock } from "@anthropic-ai/sdk/resources/messages";
import { sql } from "@/lib/db";
import { runChatLoop } from "@/lib/chat-loop";
import { isGoogleCalendarConnected } from "@/lib/google-auth";
import { isTimeOfDay } from "@/lib/time-of-day";

// The "BOOK" button on a Today task (TodayTaskRow → BookButton) — a
// one-task shortcut into the same tool-use loop the chat and morning cron
// use, so it gets the same judgment (planning rules, duration, conflict
// check) rather than a separate naive "just pick 9am" code path.

export const dynamic = "force-dynamic";

function isTextBlock(b: { type: string }): b is TextBlock {
  return b.type === "text";
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 500 });
  }
  if (!(await isGoogleCalendarConnected())) {
    return NextResponse.json(
      { error: "Google Calendar isn't connected yet — connect it at /settings first." },
      { status: 400 }
    );
  }

  const db = sql();
  const rows = (await db`
    SELECT id, name, time_of_day FROM tasks WHERE id = ${id}
  `) as { id: string; name: string; time_of_day: string | null }[];
  if (!rows.length) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }
  const timeOfDay = isTimeOfDay(rows[0].time_of_day) ? rows[0].time_of_day : null;
  const timeOfDayNote = timeOfDay
    ? ` It has a "${timeOfDay}" time-of-day preference set — book it in that part of the day.`
    : "";

  const prompt = `Book my task "${rows[0].name}" (task_id: "${id}") onto the calendar — pick the best time yourself, following my planning rules and whatever's already on the calendar.${timeOfDayNote} Call schedule_task directly with that task_id; you don't need list_tasks first, you already have the id and name, though list_calendar_events may help you pick a good slot if today's already busy. Reply with one short sentence saying what you booked, or why you couldn't.`;

  const messages: MessageParam[] = [{ role: "user", content: prompt }];

  try {
    const result = await runChatLoop(messages);
    const summary = result.messages
      .filter((m) => m.role === "assistant")
      .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
      .filter(isTextBlock)
      .map((b) => b.text)
      .join("\n");

    // Ground truth on whether it actually got booked comes from the DB,
    // not from parsing the model's prose — schedule_task is what sets
    // calendar_event_id, so a re-read here is authoritative either way.
    const after = (await db`
      SELECT calendar_event_id FROM tasks WHERE id = ${id}
    `) as { calendar_event_id: string | null }[];
    const calendarEventId = after[0]?.calendar_event_id ?? null;

    if (!calendarEventId) {
      return NextResponse.json({
        ok: false,
        message: summary || result.error || "Couldn't book that.",
      });
    }
    return NextResponse.json({ ok: true, message: summary, calendarEventId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Booking failed." },
      { status: 500 }
    );
  }
}
