"use client";

// Read-only preview panel. Per the design brief this is intentionally not a
// live Google Calendar integration for the MVP — just a docked sidebar so
// today's shape is visible alongside the task list. Wiring it up to the
// real Google Calendar API is a deliberately separate, later step.

const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface Event {
  time: string;
  title: string;
  meta: string;
  barColor: string;
  dim?: boolean;
}

const TODAY_EVENTS: Event[] = [
  { time: "09:30", title: "Daily standup", meta: "15 min · Meet", barColor: "#2B34EE" },
  {
    time: "11:00",
    title: "Client review — deck walkthrough",
    meta: "1 hr · with Priya, Marcus",
    barColor: "#2B34EE",
  },
];

const TODAY_EVENTS_AFTER_NOW: Event[] = [
  { time: "15:00", title: "1:1 with Marcus", meta: "30 min", barColor: "#C6C9FA" },
  { time: "17:30", title: "Physio", meta: "45 min · Newtown", barColor: "#C6C9FA" },
];

const TOMORROW_EVENTS: Event[] = [
  { time: "09:00", title: "Workshop prep", meta: "2 hrs", barColor: "#EAEAE4", dim: true },
  { time: "14:00", title: "Design crit", meta: "1 hr", barColor: "#EAEAE4", dim: true },
];

function EventRow({ event }: { event: Event }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <span
        style={{
          flex: "none",
          width: 52,
          fontSize: 11.5,
          fontWeight: 700,
          color: event.dim ? "#B0B0A7" : "#9A9A91",
          paddingTop: 2,
        }}
      >
        {event.time}
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          borderLeft: `3px solid ${event.barColor}`,
          padding: "2px 0 2px 10px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: event.dim ? "#5E5E56" : undefined }}>
          {event.title}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: event.dim ? "#B0B0A7" : "#9A9A91" }}>
          {event.meta}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPanel({ today }: { today: Date }) {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayLabel = `TODAY · ${DAY_ABBR[today.getDay()]} ${today.getDate()}`;
  const tomorrowLabel = `TOMORROW · ${DAY_ABBR[tomorrow.getDay()]} ${tomorrow.getDate()}`;

  return (
    <div
      style={{
        flex: "none",
        width: 326,
        position: "sticky",
        top: 28,
        background: "#FFFFFF",
        border: "1px solid #E6E6E0",
        borderRadius: 22,
        padding: "18px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "0 2px 14px",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#8E8E85" }}>
          CALENDAR
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#B0B0A7", letterSpacing: ".02em" }}>
          GOOGLE · READ ONLY
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#14140F" }}>
          {todayLabel}
        </span>

        {TODAY_EVENTS.map((e) => (
          <EventRow key={e.title} event={e} />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "3px 0" }}>
          <span
            style={{
              flex: "none",
              width: 52,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".08em",
              color: "#7E8A16",
              textAlign: "right",
            }}
          >
            NOW
          </span>
          <span style={{ flex: 1, height: 3, borderRadius: 99, background: "#D6EC3C" }} />
        </div>

        {TODAY_EVENTS_AFTER_NOW.map((e) => (
          <EventRow key={e.title} event={e} />
        ))}

        <div style={{ height: 1, background: "#EDEDE7", margin: "8px 0 4px" }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#B0B0A7" }}>
          {tomorrowLabel}
        </span>

        {TOMORROW_EVENTS.map((e) => (
          <EventRow key={e.title} event={e} />
        ))}
      </div>
    </div>
  );
}
