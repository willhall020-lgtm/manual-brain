import type Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { getState } from "./data";
import { createCalendarEvent } from "./google-calendar";
import { isGoogleCalendarConnected } from "./google-auth";

// The three tools the chat needs to do what the Slack routine used to do:
// see what's outstanding, book it on the calendar, and mark it done once
// it's actually finished. Kept deliberately small — no create/delete/edit
// tools here, the dashboard UI already owns those.

export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_tasks",
    description:
      "Lists all not-done tasks across every list, with each task's id, name, list name, and urgency (Today / 2–3 days / End of this week / This month / Custom). Call this first in any conversation about what to work on or schedule.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "schedule_task",
    description:
      "Books a task onto the user's Google Calendar as an event. Use the task's own name as the event title unless the user asks for something else. Times must be RFC3339 with a UTC offset, e.g. \"2026-08-28T15:00:00+10:00\" — ask the user for their timezone if it's genuinely ambiguous, otherwise infer from context.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "The task's id, from list_tasks." },
        start_iso: { type: "string", description: "RFC3339 start datetime with UTC offset." },
        end_iso: { type: "string", description: "RFC3339 end datetime with UTC offset." },
      },
      required: ["task_id", "start_iso", "end_iso"],
      additionalProperties: false,
    },
  },
  {
    name: "mark_task_done",
    description:
      "Marks a task as done. Only call this when the user says the task is actually finished — scheduling it is not the same as finishing it.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "The task's id, from list_tasks." },
      },
      required: ["task_id"],
      additionalProperties: false,
    },
  },
];

export async function runChatTool(name: string, input: unknown): Promise<string> {
  switch (name) {
    case "list_tasks": {
      const { sections, tasks } = await getState();
      const sectionName = (id: string) => sections.find((s) => s.id === id)?.name ?? "";
      const active = tasks
        .filter((t) => !t.doneAt)
        .map((t) => ({
          id: t.id,
          name: t.name,
          list: sectionName(t.sectionId),
          urgency: t.urgency === "Custom" ? t.customLabel || "Custom" : t.urgency,
        }));
      return JSON.stringify(active);
    }

    case "schedule_task": {
      const { task_id, start_iso, end_iso } = input as {
        task_id: string;
        start_iso: string;
        end_iso: string;
      };
      if (!(await isGoogleCalendarConnected())) {
        return JSON.stringify({
          error: "Google Calendar isn't connected yet. Tell the user to connect it at /settings first.",
        });
      }
      const db = sql();
      const rows = (await db`SELECT name FROM tasks WHERE id = ${task_id}`) as { name: string }[];
      if (!rows.length) return JSON.stringify({ error: `No task with id ${task_id}.` });

      const event = await createCalendarEvent({
        title: rows[0].name,
        startISO: start_iso,
        endISO: end_iso,
      });
      return JSON.stringify({ ok: true, eventLink: event.htmlLink });
    }

    case "mark_task_done": {
      const { task_id } = input as { task_id: string };
      const db = sql();
      const rows = (await db`
        UPDATE tasks SET done_at = now() WHERE id = ${task_id}
        RETURNING id
      `) as { id: string }[];
      if (!rows.length) return JSON.stringify({ error: `No task with id ${task_id}.` });
      return JSON.stringify({ ok: true });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
