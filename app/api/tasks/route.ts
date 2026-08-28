import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isUrgencyKey } from "@/lib/urgency";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sectionId =
      typeof body?.sectionId === "string" ? body.sectionId : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const urgency = isUrgencyKey(body?.urgency) ? body.urgency : "Today";
    const customLabel =
      urgency === "Custom"
        ? (typeof body?.customLabel === "string" && body.customLabel.trim()) ||
          "Custom"
        : null;

    if (!sectionId || !name) {
      return NextResponse.json(
        { error: "sectionId and name are required" },
        { status: 400 }
      );
    }

    // Optional — how long the task is expected to take, in minutes. Lets
    // the chat size the calendar event off a real number instead of
    // guessing (lib/chat-tools.ts's schedule_task). Any non-positive or
    // non-numeric value is treated as "not set" rather than a 400 — this
    // field is a courtesy, not something worth failing task creation over.
    const durationMinutes =
      typeof body?.durationMinutes === "number" &&
      Number.isFinite(body.durationMinutes) &&
      body.durationMinutes > 0
        ? Math.round(body.durationMinutes)
        : null;

    const db = sql();
    const [{ next_pos }] = (await db`
      SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
      FROM tasks WHERE section_id = ${sectionId}
    `) as { next_pos: number }[];

    const id = "task_" + crypto.randomUUID().slice(0, 8);
    await db`
      INSERT INTO tasks (id, section_id, name, urgency, custom_label, position, duration_minutes)
      VALUES (${id}, ${sectionId}, ${name}, ${urgency}, ${customLabel}, ${next_pos}, ${durationMinutes})
    `;

    return NextResponse.json(
      { id, sectionId, name, urgency, customLabel, doneAt: null, durationMinutes },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create the task.",
      },
      { status: 500 }
    );
  }
}
