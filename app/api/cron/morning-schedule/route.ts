import { NextResponse } from "next/server";
import type { MessageParam, TextBlock } from "@anthropic-ai/sdk/resources/messages";
import { runChatLoop } from "@/lib/chat-loop";
import { isGoogleCalendarConnected } from "@/lib/google-auth";

// A GitHub Actions scheduled workflow (.github/workflows/morning-schedule.yml)
// hits this on a schedule — same assistant and tools as the interactive
// chat (lib/chat-loop.ts), just started by a fixed prompt instead of the
// user typing one in. Used to be Vercel's own cron (see vercel.json), but
// that's Hobby-plan and doesn't guarantee the scheduled minute — it was
// firing 10-30min late every day in practice. GitHub Actions' scheduler
// is tighter, though still not exact.
//
// Scheduled for 08:15 UTC, i.e. 09:15 BST. Both Vercel Cron and GitHub
// Actions schedules are UTC only — no per-request timezone/DST handling —
// so this drifts to 08:15 local once the UK falls back to GMT in autumn.
// Cheapest fix if that matters: bump the workflow's cron schedule by an
// hour each October/March. A DST-aware version (poll every few minutes,
// check Europe/London time server-side) needs more frequent invocations
// than a once-a-day trigger allows.

export const dynamic = "force-dynamic";

const PROMPT =
  "Morning check-in — nobody's here to answer questions, so use your own judgment. " +
  "Look at what's outstanding and book any not-yet-scheduled tasks due today or earlier " +
  "(overdue tasks roll forward until they're done, so treat them the same as today's) onto " +
  "the calendar for today, spread across sensible working hours per the planning rules — and " +
  "honoring each task's own time_of_day preference (morning/afternoon/evening) from list_tasks " +
  "where it's set, over the general planning rules if the two pull in different directions. Skip " +
  "anything list_tasks already shows as scheduled. If there's nothing to book, just say so briefly.";

function isTextBlock(b: { type: string }): b is TextBlock {
  return b.type === "text";
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 500 });
  }
  if (!(await isGoogleCalendarConnected())) {
    return NextResponse.json({ ok: true, skipped: "Google Calendar isn't connected." });
  }

  const messages: MessageParam[] = [{ role: "user", content: PROMPT }];
  try {
    const result = await runChatLoop(messages);
    const summary = result.messages
      .filter((m) => m.role === "assistant")
      .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
      .filter(isTextBlock)
      .map((b) => b.text)
      .join("\n");
    return NextResponse.json({ ok: true, summary: summary || null, error: result.error });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Morning schedule run failed." },
      { status: 500 }
    );
  }
}
