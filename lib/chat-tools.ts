import type Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { getState } from "./data";
import { createCalendarEvent } from "./google-calendar";
import { isGoogleCalendarConnected } from "./google-auth";
import { URGENCY_KEYS } from "./urgency";

// The tools the chat needs to do what the Slack routine used to do — see
// what's outstanding, add to it, book it on the calendar, and mark it done
// once it's actually finished. No edit/delete tools here; the dashboard UI
// owns those.

export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_tasks",
    description:
      "Lists every list name and all not-done tasks across every list, with each task's id, name, list name, urgency (Today / 2–3 days / End of this week / This month / Custom), and whether it's already booked on the calendar (scheduled: true/false). Call this first in any conversation about what's outstanding, what to schedule, or before adding a task (to get valid list names) — and always before booking anything, to avoid double-booking a task that's already scheduled.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "add_task",
    description:
      "Adds a new task to a list. list_name must match one of the list names from list_tasks exactly (case-insensitive) — if the user names a list that doesn't exist, ask them rather than guessing or inventing one.",
    input_schema: {
      type: "object",
      properties: {
        list_name: { type: "string", description: "Exact list name, from list_tasks." },
        name: { type: "string", description: "The task's text." },
        urgency: {
          type: "string",
          enum: URGENCY_KEYS,
          description: "Defaults to \"Today\" if not specified by the user.",
        },
        custom_label: {
          type: "string",
          description: "Only used when urgency is \"Custom\" — the free-text label to show instead.",
        },
      },
      required: ["list_name", "name"],
      additionalProperties: false,
    },
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
          scheduled: !!t.calendarEventId,
        }));
      return JSON.stringify({ lists: sections.map((s) => s.name), tasks: active });
    }

    case "add_task": {
      const { list_name, name, urgency, custom_label } = input as {
        list_name: string;
        name: string;
        urgency?: string;
        custom_label?: string;
      };
      const { sections } = await getState();
      const section = sections.find((s) => s.name.toLowerCase() === list_name.toLowerCase());
      if (!section) {
        return JSON.stringify({
          error: `No list named "${list_name}". Valid lists: ${sections.map((s) => s.name).join(", ")}.`,
        });
      }
      const trimmedName = name.trim();
      if (!trimmedName) return JSON.stringify({ error: "name cannot be empty." });

      const resolvedUrgency = urgency && (URGENCY_KEYS as string[]).includes(urgency) ? urgency : "Today";
      const resolvedCustomLabel = resolvedUrgency === "Custom" ? custom_label?.trim() || "Custom" : null;

      const db = sql();
      const [{ next_pos }] = (await db`
        SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
        FROM tasks WHERE section_id = ${section.id}
      `) as { next_pos: number }[];
      const id = "task_" + crypto.randomUUID().slice(0, 8);
      await db`
        INSERT INTO tasks (id, section_id, name, urgency, custom_label, position)
        VALUES (${id}, ${section.id}, ${trimmedName}, ${resolvedUrgency}, ${resolvedCustomLabel}, ${next_pos})
      `;
      return JSON.stringify({ ok: true, id, list: section.name });
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
      // Records the booking so list_tasks can flag this task as already
      // scheduled — the morning cron relies on that to avoid rebooking the
      // same task every day.
      await db`UPDATE tasks SET calendar_event_id = ${event.id} WHERE id = ${task_id}`;
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
