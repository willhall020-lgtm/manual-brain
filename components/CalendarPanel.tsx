"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CalendarEvent } from "@/lib/gcal";

const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

function EventRow({ event, dim }: { event: CalendarEvent; dim?: boolean }) {
  const mins = Math.round((event.end.getTime() - event.start.getTime()) / 60000);
  const durationLabel = event.allDay
    ? "All day"
    : mins < 60
    ? `${mins} min`
    : `${Math.round((mins / 60) * 2) / 2} hr`;
  const meta = [durationLabel, event.location].filter(Boolean).join(" · ");

  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <span
        style={{
          flex: "none",
          width: 52,
          fontSize: 11.5,
          fontWeight: 700,
          color: dim ? "#B0B0A7" : "#9A9A91",
          paddingTop: 2,
        }}
      >
        {event.allDay ? "" : fmtTime(event.start)}
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          borderLeft: `3px solid ${dim ? "#EAEAE4" : "#2B34EE"}`,
          padding: "2px 0 2px 10px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: dim ? "#5E5E56" : undefined }}>
          {event.title}
        </div>
        {meta && (
          <div style={{ fontSize: 11.5, fontWeight: 500, color: dim ? "#B0B0A7" : "#9A9A91" }}>
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  today: Date;
  events: CalendarEvent[];
  configured: boolean;
  loadError: boolean;
}

export default function CalendarPanel({ today, events, configured, loadError }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  // Read once per mount (not on every render) — the "now" divider only
  // needs to be roughly right, and a refresh (which remounts fresh data
  // anyway) is the trigger to recompute it.
  const [now] = useState(() => Date.now());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayLabel = `TODAY · ${DAY_ABBR[today.getDay()]} ${today.getDate()}`;
  const tomorrowLabel = `TOMORROW · ${DAY_ABBR[tomorrow.getDay()]} ${tomorrow.getDate()}`;

  const todayEvents = events.filter((e) => e.day === "today");
  const tomorrowEvents = events.filter((e) => e.day === "tomorrow");
  const todayBefore = todayEvents.filter((e) => e.end.getTime() <= now);
  const todayAfter = todayEvents.filter((e) => e.end.getTime() > now);

  function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  }

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
        <button
          onClick={refresh}
          disabled={refreshing}
          style={{
            background: "transparent",
            border: 0,
            fontSize: 10.5,
            fontWeight: 700,
            color: "#B0B0A7",
            letterSpacing: ".02em",
            cursor: "pointer",
          }}
        >
          {configured ? (refreshing ? "REFRESHING…" : "GOOGLE · READ ONLY ↻") : "NOT CONNECTED"}
        </button>
      </div>

      {!configured && (
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#93938A", lineHeight: 1.5, padding: "0 2px" }}>
          Add <code>GCAL_ICS_URL</code> to show your calendar here.
        </div>
      )}

      {configured && loadError && (
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#B3261E", lineHeight: 1.5, padding: "0 2px" }}>
          Couldn&apos;t load your calendar right now.
        </div>
      )}

      {configured && !loadError && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#14140F" }}>
            {todayLabel}
          </span>

          {todayBefore.map((e) => (
            <EventRow key={e.id} event={e} dim />
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

          {todayAfter.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}

          {todayEvents.length === 0 && (
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "#B0B0A7" }}>Nothing on today.</div>
          )}

          <div style={{ height: 1, background: "#EDEDE7", margin: "8px 0 4px" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#B0B0A7" }}>
            {tomorrowLabel}
          </span>

          {tomorrowEvents.map((e) => (
            <EventRow key={e.id} event={e} dim />
          ))}

          {tomorrowEvents.length === 0 && (
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "#B0B0A7" }}>Nothing on tomorrow.</div>
          )}
        </div>
      )}
    </div>
  );
}
