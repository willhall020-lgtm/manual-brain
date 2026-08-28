import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isUrgencyKey } from "@/lib/urgency";

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

    if (body?.urgency !== undefined) {
      if (!isUrgencyKey(body.urgency)) {
        return NextResponse.json({ error: "invalid urgency" }, { status: 400 });
      }
      const customLabel =
        body.urgency === "Custom"
          ? (typeof body.customLabel === "string" && body.customLabel.trim()) ||
            "Custom"
          : null;
      await db`
        UPDATE tasks SET urgency = ${body.urgency}, custom_label = ${customLabel}
        WHERE id = ${id}
      `;
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

    const rows = (await db`
      SELECT id, section_id, name, urgency, custom_label, done_at, duration_minutes
      FROM tasks WHERE id = ${id}
    `) as {
      id: string;
      section_id: string;
      name: string;
      urgency: string;
      custom_label: string | null;
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
      urgency: t.urgency,
      customLabel: t.custom_label,
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
