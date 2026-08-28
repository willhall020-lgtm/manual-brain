import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

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
