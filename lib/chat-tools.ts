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
      "Lists every list name and all not-done tasks across every list, with each task's id, name, list name, urgency (Today / 2–3 days / End of this week / This month / Custom), whether it's already booked on the calendar (scheduled: true/false), and duration_minutes if the user set one when creating it (null if not — estimate it yourself when booking). Call this first in any conversation about what's outstanding, what to schedule, or before adding a task (to get valid list names) — and always before booking anything, to avoid double-booking a task that's already scheduled.",
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
        duration_minutes: {
          type: "integer",
          description: "Optional — how long the task is expected to take, in minutes, if the user gives one.",
        },
      },
      required: ["list_name", "name"],
      additionalProperties: false,
    },
  },
  {
    name: "schedule_task",
    description:
      "Books a task onto the user's Google Calendar as an event. Use the task's own name as the event title unless the user asks for something else. start_iso must be RFC3339 with a UTC offset, e.g. \"2026-08-28T15:00:00+10:00\" — ask the user for their timezone if it's genuinely ambiguous, otherwise infer from context. For how long the event runs, give EITHER end_iso (only when the user's stated an exact end time themselves) OR duration_minutes (preferred otherwise) — and when passing duration_minutes, use the task's own duration_minutes from list_tasks if it has one, or your own realistic estimate of how long the task actually takes if it doesn't. If you pass neither, the task's own duration is used automatically, falling back to 30 minutes.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "The task's id, from list_tasks." },
        start_iso: { type: "string", description: "RFC3339 start datetime with UTC offset." },
        end_iso: { type: "string", description: "RFC3339 end datetime with UTC offset — only when the user gave an exact end time." },
        duration_minutes: { type: "integer", description: "How long to block, in minutes — preferred over end_iso." },
      },
      required: ["task_id", "start_iso"],
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
          duration_minutes: t.durationMinutes,
        }));
      return JSON.stringify({ lists: sections.map((s) => s.name), tasks: active });
    }

    case "add_task": {
      const { list_name, name, urgency, custom_label, duration_minutes } = input as {
        list_name: string;
        name: string;
        urgency?: string;
        custom_label?: string;
        duration_minutes?: number;
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
      const resolvedDuration =
        typeof duration_minutes === "number" && Number.isFinite(duration_minutes) && duration_minutes > 0
          ? Math.round(duration_minutes)
          : null;

      const db = sql();
      const [{ next_pos }] = (await db`
        SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
        FROM tasks WHERE section_id = ${section.id}
      `) as { next_pos: number }[];
      const id = "task_" + crypto.randomUUID().slice(0, 8);
      await db`
        INSERT INTO tasks (id, section_id, name, urgency, custom_label, position, duration_minutes)
        VALUES (${id}, ${section.id}, ${trimmedName}, ${resolvedUrgency}, ${resolvedCustomLabel}, ${next_pos}, ${resolvedDuration})
      `;
      return JSON.stringify({ ok: true, id, list: section.name });
    }

    case "schedule_task": {
      const { task_id, start_iso, end_iso, duration_minutes } = input as {
        task_id: string;
        start_iso: string;
        end_iso?: string;
        duration_minutes?: number;
      };
      if (!(await isGoogleCalendarConnected())) {
        return JSON.stringify({
          error: "Google Calendar isn't connected yet. Tell the user to connect it at /settings first.",
        });
      }
      const db = sql();
      const rows = (await db`
        SELECT name, duration_minutes FROM tasks WHERE id = ${task_id}
      `) as { name: string; duration_minutes: number | null }[];
      if (!rows.length) return JSON.stringify({ error: `No task with id ${task_id}.` });

      // end_iso wins if the model gave one (the user stated an exact end
      // time); otherwise size the event off duration_minutes — the call's
      // own, then the task's stored one, then a 30-minute default — and
      // compute the end time here rather than trust the model's date math.
      let endISO = end_iso;
      if (!endISO) {
        const start = new Date(start_iso);
        if (Number.isNaN(start.getTime())) {
          return JSON.stringify({ error: `start_iso "${start_iso}" isn't a valid RFC3339 datetime.` });
        }
        const minutes = duration_minutes ?? rows[0].duration_minutes ?? 30;
        endISO = new Date(start.getTime() + minutes * 60000).toISOString();
      }

      const event = await createCalendarEvent({
        title: rows[0].name,
        startISO: start_iso,
        endISO,
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
