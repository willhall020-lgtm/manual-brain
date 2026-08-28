import ical from "node-ical";

// Reads the calendar's private iCal feed (Settings → a calendar →
// "Integrate calendar" → Secret address in iCal format) and returns the
// events that fall in [today 00:00, day-after-tomorrow 00:00) — i.e. all of
// today plus all of tomorrow, which is what the sidebar shows. Read-only:
// there is no write path back to Google Calendar in the MVP.

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location: string | null;
  day: "today" | "tomorrow";
}

function durationLabel(startMs: number, endMs: number): string {
  const mins = Math.round((endMs - startMs) / 60000);
  if (mins <= 0) return "";
  if (mins < 60) return `${mins} min`;
  const hrs = mins / 60;
  const rounded = Math.round(hrs * 2) / 2; // nearest half hour
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)} hr`;
}

export { durationLabel };

// node-ical types some properties (summary, location) as either a plain
// string or a { val, params } object when the source ICS line carried
// parameters (e.g. a language tag) — normalize to a plain string.
function textValue(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "val" in v) return String((v as { val: unknown }).val);
  return "";
}

/** Fetches and window-filters the feed. Throws on network/parse failure —
 * callers decide how to degrade (the panel just hides itself). */
export async function getCalendarEvents(rangeStart: Date, rangeEnd: Date): Promise<CalendarEvent[]> {
  const url = process.env.GCAL_ICS_URL;
  if (!url) return [];

  const data = await ical.async.fromURL(url);
  const startOfToday = new Date(rangeStart);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const out: CalendarEvent[] = [];

  for (const key of Object.keys(data)) {
    const raw = data[key];
    if (!raw || raw.type !== "VEVENT" || !raw.start) continue;
    const ev = raw; // narrowed to VEvent — reassigned so the closure below keeps the narrowing
    const allDay = (ev.datetype as string | undefined) === "date";
    const durationMs = ev.end ? ev.end.getTime() - ev.start.getTime() : 0;

    function pushIfInRange(occStart: Date) {
      if (occStart >= rangeEnd || occStart < rangeStart) return;
      const occEnd = new Date(occStart.getTime() + durationMs);
      out.push({
        id: `${key}-${occStart.getTime()}`,
        title: textValue(ev.summary) || "(untitled event)",
        start: occStart,
        end: occEnd,
        allDay,
        location: textValue(ev.location) || null,
        day: occStart < startOfTomorrow ? "today" : "tomorrow",
      });
    }

    if (ev.rrule) {
      // Expand recurrence within the window (with a day's padding either
      // side so timezone shifts near midnight don't drop an occurrence).
      const padStart = new Date(rangeStart.getTime() - 24 * 60 * 60 * 1000);
      const padEnd = new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000);
      const occurrences = ev.rrule.between(padStart, padEnd, true);
      for (const occStart of occurrences) {
        if (ev.exdate && Object.values(ev.exdate).some((d) => (d as Date).getTime() === occStart.getTime())) {
          continue;
        }
        pushIfInRange(occStart);
      }
    } else {
      pushIfInRange(ev.start);
    }
  }

  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}
