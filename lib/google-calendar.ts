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
