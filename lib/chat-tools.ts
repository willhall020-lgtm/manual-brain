import type Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { getState } from "./data";
import { createCalendarEvent, listCalendarEvents } from "./google-calendar";
import { isGoogleCalendarConnected } from "./google-auth";
import { isDueDateString, isOverdue } from "./due-date";
import { isTimeOfDay } from "./time-of-day";

// The tools the chat needs to do what the Slack routine used to do — see
// what's outstanding, add to it, book it on the calendar, and mark it done
// once it's actually finished. No edit/delete tools here; the dashboard UI
// owns those.

export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_tasks",
    description:
      "Lists every list name and all not-done tasks across every list, with each task's id, name, list name, due_date (\"YYYY-MM-DD\", or null for no due date), overdue (true if due_date is before today and it's still not done), whether it's already booked on the calendar (scheduled: true/false), duration_minutes if the user set one when creating it (null if not — estimate it yourself when booking), and time_of_day (\"morning\", \"afternoon\", \"evening\", or null for no preference — a hint for what part of the day to book it in when schedule_task's start_iso isn't otherwise dictated by the user). Call this first in any conversation about what's outstanding, what to schedule, or before adding a task (to get valid list names) — and always before booking anything, to avoid double-booking a task that's already scheduled.",
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
        due_date: {
          type: "string",
          description: "Optional \"YYYY-MM-DD\". Use today's date (see current time above) for something due today, a specific date if one's implied, or leave this unset entirely for a someday/backlog item with no firm date — don't default to today just because none was mentioned.",
        },
        duration_minutes: {
          type: "integer",
          description: "Optional — how long the task is expected to take, in minutes, if the user gives one.",
        },
        time_of_day: {
          type: "string",
          enum: ["morning", "afternoon", "evening"],
          description: "Optional — roughly when in the day this should be booked, only if the user actually said so (e.g. \"sometime in the morning\"). Leave unset otherwise; don't guess at a preference nobody stated.",
        },
      },
      required: ["list_name", "name"],
      additionalProperties: false,
    },
  },
  {
    name: "list_calendar_events",
    description:
      "Lists events already on the calendar within a time range — use this to see gaps and existing commitments before proposing times, e.g. for planning a whole day. Not strictly required before every schedule_task call: that tool checks for a conflict on the exact slot itself and refuses to double-book without it. This is for seeing the shape of a day, not just checking one slot.",
    input_schema: {
      type: "object",
      properties: {
        start_iso: { type: "string", description: "RFC3339 start of the range, with UTC offset." },
        end_iso: { type: "string", description: "RFC3339 end of the range, with UTC offset." },
      },
      required: ["start_iso", "end_iso"],
      additionalProperties: false,
    },
  },
  {
    name: "schedule_task",
    description:
      "Books a task onto the user's Google Calendar as an event. Use the task's own name as the event title unless the user asks for something else. start_iso must be RFC3339 with a UTC offset, e.g. \"2026-08-28T15:00:00+10:00\" — ask the user for their timezone if it's genuinely ambiguous, otherwise infer from context. If the user hasn't given an exact time themselves and the task has a time_of_day from list_tasks (morning/afternoon/evening), pick start_iso to actually land in that part of the day rather than defaulting to a round number out of habit — it's a real preference the user set, not a suggestion to override without reason. For how long the event runs, give EITHER end_iso (only when the user's stated an exact end time themselves) OR duration_minutes (preferred otherwise) — and when passing duration_minutes, use the task's own duration_minutes from list_tasks if it has one, or your own realistic estimate of how long the task actually takes if it doesn't. If you pass neither, the task's own duration is used automatically, falling back to 30 minutes. Refuses (with an error naming the conflicting event) if the proposed slot overlaps something already on the calendar — pick a different time, or pass force: true only if the user explicitly wants to double-book anyway.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "The task's id, from list_tasks." },
        start_iso: { type: "string", description: "RFC3339 start datetime with UTC offset." },
        end_iso: { type: "string", description: "RFC3339 end datetime with UTC offset — only when the user gave an exact end time." },
        duration_minutes: { type: "integer", description: "How long to block, in minutes — preferred over end_iso." },
        force: { type: "boolean", description: "Only set true if the user explicitly wants to double-book despite a conflict." },
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
      const todayKey = new Date().toISOString().slice(0, 10);
      const active = tasks
        .filter((t) => !t.doneAt)
        .map((t) => ({
          id: t.id,
          name: t.name,
          list: sectionName(t.sectionId),
          due_date: t.dueDate,
          overdue: t.dueDate !== null && isOverdue(t.dueDate, todayKey),
          scheduled: !!t.calendarEventId,
          duration_minutes: t.durationMinutes,
          time_of_day: t.timeOfDay,
        }));
      return JSON.stringify({ lists: sections.map((s) => s.name), tasks: active });
    }

    case "add_task": {
      const { list_name, name, due_date, duration_minutes, time_of_day } = input as {
        list_name: string;
        name: string;
        due_date?: string;
        duration_minutes?: number;
        time_of_day?: string;
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

      const resolvedDueDate = isDueDateString(due_date) ? due_date : null;
      const resolvedDuration =
        typeof duration_minutes === "number" && Number.isFinite(duration_minutes) && duration_minutes > 0
          ? Math.round(duration_minutes)
          : null;
      const resolvedTimeOfDay = isTimeOfDay(time_of_day) ? time_of_day : null;

      const db = sql();
      const [{ next_pos }] = (await db`
        SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
        FROM tasks WHERE section_id = ${section.id}
      `) as { next_pos: number }[];
      const id = "task_" + crypto.randomUUID().slice(0, 8);
      await db`
        INSERT INTO tasks (id, section_id, name, due_date, position, duration_minutes, time_of_day)
        VALUES (${id}, ${section.id}, ${trimmedName}, ${resolvedDueDate}, ${next_pos}, ${resolvedDuration}, ${resolvedTimeOfDay})
      `;
      return JSON.stringify({ ok: true, id, list: section.name });
    }

    case "list_calendar_events": {
      const { start_iso, end_iso } = input as { start_iso: string; end_iso: string };
      if (!(await isGoogleCalendarConnected())) {
        return JSON.stringify({
          error: "Google Calendar isn't connected yet. Tell the user to connect it at /settings first.",
        });
      }
      const events = await listCalendarEvents(start_iso, end_iso);
      return JSON.stringify({ events });
    }

    case "schedule_task": {
      const { task_id, start_iso, end_iso, duration_minutes, force } = input as {
        task_id: string;
        start_iso: string;
        end_iso?: string;
        duration_minutes?: number;
        force?: boolean;
      };
      if (!(await isGoogleCalendarConnected())) {
        return JSON.stringify({
          error: "Google Calendar isn't connected yet. Tell the user to connect it at /settings first.",
        });
      }
      const db = sql();
      const rows = (await db`
        SELECT name, duration_minutes, calendar_event_id FROM tasks WHERE id = ${task_id}
      `) as { name: string; duration_minutes: number | null; calendar_event_id: string | null }[];
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

      // Planning rules say "protect existing events" — enforced here, not
      // just requested in the system prompt. Google's timeMin/timeMax
      // already returns only genuinely-overlapping events; excluding this
      // task's own prior booking lets rescheduling the same task work.
      if (!force) {
        const overlapping = (await listCalendarEvents(start_iso, endISO)).filter(
          (e) => e.id !== rows[0].calendar_event_id
        );
        if (overlapping.length) {
          return JSON.stringify({
            error: `That overlaps ${overlapping.length === 1 ? "an existing event" : "existing events"}: ${overlapping
              .map((e) => `"${e.title}" (${e.startISO}–${e.endISO})`)
              .join(", ")}. Pick a different time, or pass force: true to double-book anyway.`,
          });
        }
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
