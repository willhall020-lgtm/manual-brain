import { getValidAccessToken } from "./google-auth";

// Write path — booking events. Read path for display stays the iCal feed
// (lib/gcal.ts); this is deliberately separate so the sidebar keeps working
// even before/without Google Calendar being connected for writes.

export interface CreateEventInput {
  title: string;
  startISO: string; // RFC3339, e.g. "2026-08-28T15:00:00+10:00"
  endISO: string;
  description?: string;
}

export interface CreatedEvent {
  id: string;
  htmlLink: string;
}

export async function createCalendarEvent(input: CreateEventInput): Promise<CreatedEvent> {
  const accessToken = await getValidAccessToken();
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.description,
        start: { dateTime: input.startISO },
        end: { dateTime: input.endISO },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Google Calendar event creation failed: ${await res.text()}`);
  }
  const data = await res.json();
  return { id: data.id, htmlLink: data.htmlLink };
}

// Used when a booked task's due date moves to a different day — the old
// event is still sitting on the old date/time, so it gets removed rather
// than left as an orphaned entry on the calendar (see the dueDate handling
// in app/api/tasks/[id]/route.ts). A 404 means it's already gone (deleted
// by hand, or this is a retry) — treated as success either way, since the
// end state ("no stale event") is the same.
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const accessToken = await getValidAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Google Calendar event deletion failed: ${await res.text()}`);
  }
}

export interface ExistingEvent {
  id: string;
  title: string;
  startISO: string;
  endISO: string;
}

// Used two ways: the chat's list_calendar_events tool (so the model can see
// gaps before proposing a time), and schedule_task's own conflict check
// (so "don't double-book over a meeting" is enforced, not just requested in
// the system prompt). Google's timeMin/timeMax already filter to events
// that genuinely overlap the window — no separate overlap math needed here.
export async function listCalendarEvents(startISO: string, endISO: string): Promise<ExistingEvent[]> {
  const accessToken = await getValidAccessToken();
  const params = new URLSearchParams({
    timeMin: startISO,
    timeMax: endISO,
    singleEvents: "true",
    orderBy: "startTime",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    throw new Error(`Google Calendar list failed: ${await res.text()}`);
  }
  const data = await res.json();
  const items = (data.items ?? []) as Array<{
    id: string;
    status?: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
  }>;
  return items
    .filter((e) => e.status !== "cancelled" && e.start && e.end)
    .map((e) => ({
      id: e.id,
      title: e.summary || "(untitled)",
      startISO: (e.start!.dateTime ?? e.start!.date)!,
      endISO: (e.end!.dateTime ?? e.end!.date)!,
    }));
}
