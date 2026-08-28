import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }

    const db = sql();
    const rows = (await db`
      UPDATE sections SET name = ${name} WHERE id = ${id}
      RETURNING id, name
    `) as { id: string; name: string }[];

    if (!rows.length) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to rename the list.",
      },
      { status: 500 }
    );
  }
}

// Tasks reference sections with ON DELETE CASCADE (schema.sql), so this
// takes the section's tasks with it — no separate cleanup query needed.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = sql();
    await db`DELETE FROM sections WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to delete the list.",
      },
      { status: 500 }
    );
  }
}
