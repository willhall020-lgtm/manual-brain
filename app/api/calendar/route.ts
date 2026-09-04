import { NextResponse } from "next/server";
import { getCalendarEvents, type CalendarEvent } from "@/lib/gcal";

// Read-only calendar feed as JSON — the same data app/page.tsx passes into
// <CalendarPanel> as server-rendered props, exposed as its own endpoint so a
// non-browser client (the iOS app) can fetch it too. Mirrors page.tsx's
// window (today 00:00 through the day after tomorrow) and its
// configured/error split: a missing GCAL_ICS_URL and a feed that failed to
// load are reported differently so the client can tell "not set up" apart
// from "broken" the same way the web sidebar does.

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = !!process.env.GCAL_ICS_URL;
  let events: CalendarEvent[] = [];
  let error = false;

  if (configured) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(startOfToday);
    rangeEnd.setDate(rangeEnd.getDate() + 2);
    try {
      events = await getCalendarEvents(startOfToday, rangeEnd);
    } catch (err) {
      console.error(err);
      error = true;
    }
  }

  // NextResponse.json runs JSON.stringify, which calls Date#toJSON() (=
  // toISOString()) on the start/end fields automatically — no manual
  // serialization needed here.
  return NextResponse.json({ configured, error, events });
}
