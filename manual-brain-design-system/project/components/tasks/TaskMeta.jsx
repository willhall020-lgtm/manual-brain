import React from "react";

// Scheduling metadata shown on a task row. Sourced from the newer build in
// the project screenshots — NOT yet in willhall020-lgtm/manual-brain, whose
// Task shape stops at { name, urgency, customLabel, doneAt }.
export function DueLabel({ due, overdue = false }) {
  if (!due) return null;
  return (
    <span style={{ flex: "none", fontSize: "var(--fs-meta)", fontWeight: overdue ? "var(--fw-bold)" : "var(--fw-medium)", color: overdue ? "var(--text-overdue)" : "var(--text-muted)", whiteSpace: "nowrap", textTransform: "lowercase" }}>
      {overdue ? "overdue · " + due : due}
    </span>
  );
}

export function DurationLabel({ minutes }) {
  if (!minutes) return null;
  const label = minutes >= 60 && minutes % 60 === 0 ? minutes / 60 + " hr" : minutes + " min";
  return (
    <span style={{ flex: "none", fontSize: "var(--fs-meta)", fontWeight: "var(--fw-medium)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
  );
}

export function WhenLabel({ when }) {
  if (!when) return null;
  return (
    <span style={{ flex: "none", fontSize: "var(--fs-meta)", fontWeight: "var(--fw-medium)", color: "var(--text-faint)", whiteSpace: "nowrap", textTransform: "lowercase" }}>{when}</span>
  );
}

export function RepeatLabel({ repeat }) {
  if (!repeat || repeat === "never") return null;
  return (
    <span style={{ flex: "none", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)", whiteSpace: "nowrap", textTransform: "lowercase" }}>↻ {repeat}</span>
  );
}

export function BookButton({ booked = false, hit = false, onClick }) {
  const pill = {
    display: "block", borderRadius: "var(--radius-pill)", padding: "5px 11px",
    fontSize: "var(--fs-micro)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-button)",
    textTransform: "lowercase",
    background: booked ? "var(--surface-booked)" : "var(--mb-ink)",
    color: booked ? "var(--text-booked)" : "#FFFFFF",
  };
  const inner = <span className="mb-bookvis" style={pill}>{booked ? "booked" : "book"}</span>;
  // The book button sits in a WRAPPING flex, so neither min-height nor a
  // negative pull works: min-height inflates the row (and forces an extra
  // wrap), and a vertical pull reaches into the line above. A pseudo-element
  // buys the 44px target with zero layout cost — see .mb-hit in base.css.
  if (hit) {
    return (
      <button
        onClick={onClick}
        className="mb-bookhit mb-hit"
        style={{ flex: "none", padding: 0, border: 0, background: "transparent", display: "block" }}
      >
        {inner}
      </button>
    );
  }
  return (
    <button onClick={onClick} className="mb-addbtn" style={{ flex: "none", padding: 0, border: 0, background: "transparent", display: "block" }}>
      {inner}
    </button>
  );
}

// The whole scheduling run in one element, in its canonical order.
export function TaskMeta({ due = null, overdue = false, minutes = null, when = null, repeat = null, booked = null, hit = false, gap = 9, onBook }) {
  if (!due && !minutes && !when && (!repeat || repeat === "never") && booked === null) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap, flexWrap: "wrap" }}>
      <DueLabel due={due} overdue={overdue} />
      <DurationLabel minutes={minutes} />
      <WhenLabel when={when} />
      <RepeatLabel repeat={repeat} />
      {booked !== null && <BookButton booked={booked} hit={hit} onClick={onBook} />}
    </div>
  );
}
