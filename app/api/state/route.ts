import { NextResponse } from "next/server";
import { getState } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { sections, tasks } = await getState();
    const bySectionId = new Map(sections.map((s) => [s.id, { ...s, tasks: [] as Omit<typeof tasks[number], "sectionId">[] }]));
    for (const t of tasks) {
      const sec = bySectionId.get(t.sectionId);
      if (!sec) continue;
      sec.tasks.push({
        id: t.id,
        name: t.name,
        dueDate: t.dueDate,
        doneAt: t.doneAt,
        calendarEventId: t.calendarEventId,
        durationMinutes: t.durationMinutes,
        timeOfDay: t.timeOfDay,
      });
    }
    return NextResponse.json({ sections: Array.from(bySectionId.values()) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load Manual Brain data.",
      },
      { status: 500 }
    );
  }
}
