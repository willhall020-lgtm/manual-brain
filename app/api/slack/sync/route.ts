import { NextResponse } from "next/server";
import { getState } from "@/lib/data";

// Posts today's not-done, "Today"-urgency tasks to the Slack channel your
// Claude routine reads from, via an Incoming Webhook — see README for setup.
// The routine picks which of these to actually put on the calendar; this
// endpoint only pushes the list, it doesn't book anything itself.

export const dynamic = "force-dynamic";

export async function POST() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "SLACK_WEBHOOK_URL is not set." },
      { status: 400 }
    );
  }

  let sections, tasks;
  try {
    ({ sections, tasks } = await getState());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load tasks." },
      { status: 500 }
    );
  }

  const sectionName = (id: string) => sections.find((s) => s.id === id)?.name ?? "";
  const todayTasks = tasks.filter((t) => !t.doneAt && t.urgency === "Today");

  if (todayTasks.length === 0) {
    return NextResponse.json({ error: "Nothing marked for today." }, { status: 400 });
  }

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const lines = todayTasks.map((t) => `• *${t.name}* _(${sectionName(t.sectionId)})_`);

  const payload = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `Manual Brain — ${dateLabel}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${todayTasks.length} task${todayTasks.length === 1 ? "" : "s"} marked *Today*:\n${lines.join("\n")}`,
        },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: "Pick which of these to schedule and book them on the calendar." },
        ],
      },
    ],
    text: `Manual Brain — ${dateLabel}: ${todayTasks.length} task(s) for today`, // fallback for notifications
  };

  const slackRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!slackRes.ok) {
    const body = await slackRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Slack rejected the message: ${body || slackRes.status}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, count: todayTasks.length });
}
