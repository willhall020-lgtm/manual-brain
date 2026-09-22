import React from "react";

function AgendaRow({ event }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ flex: "none", width: 44, fontSize: 12, fontWeight: "var(--fw-bold)", color: event.dim ? "var(--text-faint)" : "var(--text-done)", paddingTop: 2 }}>{event.time}</span>
      <div style={{ flex: 1, minWidth: 0, borderLeft: "3px solid " + event.barColor, padding: "1px 0 1px 11px" }}>
        <div style={{ fontSize: "var(--fs-body)", fontWeight: "var(--fw-semibold)", lineHeight: "var(--lh-snug)", color: event.dim ? "var(--mb-g-900)" : undefined, textTransform: "lowercase" }}>{event.title}</div>
        <div style={{ fontSize: 12, fontWeight: "var(--fw-medium)", color: event.dim ? "var(--text-faint)" : "var(--text-done)", marginTop: 2 }}>{event.meta}</div>
      </div>
    </div>
  );
}

export function AgendaList({ before = [], after = [], showNow = true, source = "google · read only", label = "calendar" }) {
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-card)", borderRadius: "var(--radius-panel)", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingBottom: 2 }}>
        <span style={{ fontSize: "var(--fs-eyebrow)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-eyebrow)", color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)", color: "var(--text-faint)", letterSpacing: ".02em" }}>{source}</span>
      </div>
      {before.map((e) => <AgendaRow key={e.title} event={e} />)}
      {showNow && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 0" }}>
          <span style={{ flex: "none", width: 44, fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-black)", letterSpacing: ".08em", color: "var(--mb-olive)", textAlign: "right" }}>now</span>
          <span style={{ flex: 1, height: 3, borderRadius: "var(--radius-pill)", background: "var(--mb-lime)" }} />
        </div>
      )}
      {after.map((e) => <AgendaRow key={e.title} event={e} />)}
      {before.length + after.length === 0 && (
        <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-semibold)", color: "var(--icon-rest)" }}>nothing in the calendar. the day is yours.</span>
      )}
    </div>
  );
}
