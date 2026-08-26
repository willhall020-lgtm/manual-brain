import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const db = sql();
    const id = "sec_" + crypto.randomUUID().slice(0, 8);
    const [{ next_pos }] = (await db`
      SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM sections
    `) as { next_pos: number }[];

    await db`
      INSERT INTO sections (id, name, position)
      VALUES (${id}, ${name}, ${next_pos})
    `;

    return NextResponse.json({ id, name }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create the list.",
      },
      { status: 500 }
    );
  }
}
