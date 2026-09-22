import React from "react";

function EventRow({ event }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <span style={{ flex: "none", width: 52, fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)", color: event.dim ? "var(--text-faint)" : "var(--text-done)", paddingTop: 2 }}>{event.time}</span>
      <div style={{ flex: 1, minWidth: 0, borderLeft: "3px solid " + event.barColor, padding: "2px 0 2px 10px" }}>
        <div style={{ fontSize: "var(--fs-meta)", fontWeight: "var(--fw-semibold)", color: event.dim ? "var(--mb-g-900)" : undefined, textTransform: "lowercase" }}>{event.title}</div>
        <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-medium)", color: event.dim ? "var(--text-faint)" : "var(--text-done)" }}>{event.meta}</div>
      </div>
    </div>
  );
}

export function CalendarPanel({ todayLabel = "today", tomorrowLabel = "tomorrow", before = [], after = [], tomorrow = [], source = "google · read only" }) {
  return (
    <div style={{ flex: "none", width: "var(--calendar-width)", position: "sticky", top: "var(--sticky-top)", background: "var(--surface-card)", border: "1px solid var(--border-card)", borderRadius: "var(--radius-panel)", padding: "var(--pad-panel)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 2px 14px" }}>
        <span style={{ fontSize: "var(--fs-eyebrow)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-eyebrow)", color: "var(--text-muted)" }}>calendar</span>
        <span style={{ fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)", color: "var(--text-faint)", letterSpacing: ".02em" }}>{source}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span style={{ fontSize: "var(--fs-eyebrow)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-daylabel)", color: "var(--text-body)" }}>{todayLabel}</span>
        {before.map((e) => <EventRow key={e.title} event={e} />)}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "3px 0" }}>
          <span style={{ flex: "none", width: 52, fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-black)", letterSpacing: ".08em", color: "var(--mb-olive)", textAlign: "right" }}>now</span>
          <span style={{ flex: 1, height: 3, borderRadius: "var(--radius-pill)", background: "var(--mb-lime)" }} />
        </div>
        {after.map((e) => <EventRow key={e.title} event={e} />)}
        <div style={{ height: 1, background: "var(--mb-n-400)", margin: "8px 0 4px" }} />
        <span style={{ fontSize: "var(--fs-eyebrow)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-daylabel)", color: "var(--text-faint)" }}>{tomorrowLabel}</span>
        {tomorrow.map((e) => <EventRow key={e.title} event={e} />)}
      </div>
    </div>
  );
}
