import React from "react";
import { CheckCircle } from "../tasks/CheckCircle.jsx";
import { UrgencyPill } from "../tasks/UrgencyPill.jsx";
import { TaskMeta } from "../tasks/TaskMeta.jsx";

export function MobileTaskRow({ name, sectionName, urgency, customLabel = null, urgencyDisplay = "pill", due = null, overdue = false, minutes = null, when = null, repeat = null, booked = null, variant = "today", onDone, onPressUrgency, onPress, onBook }) {
  const flat = variant === "today";
  const hasMeta = due || minutes || when || (repeat && repeat !== "never") || booked !== null;
  // The whole card is the edit target, so every control inside it has to
  // stop the click from also opening the task sheet.
  const stop = (fn) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (fn) fn();
  };
  return (
    <div
      onClick={onPress}
      role={onPress ? "button" : undefined}
      tabIndex={onPress ? 0 : undefined}
      onKeyDown={onPress ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPress(); } } : undefined}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "var(--surface-card)", border: flat ? "none" : "1px solid var(--border-card)", borderRadius: "var(--radius-row)", padding: "13px 10px 13px 14px", minHeight: 56, cursor: onPress ? "pointer" : "default" }}
    >
      <CheckCircle size={24} hit onClick={stop(onDone)} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "var(--fs-body-lg)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", lineHeight: "var(--lh-snug)", textTransform: "lowercase" }}>{name}</span>
          {sectionName && (
            <span style={{ fontSize: "var(--fs-eyebrow-sm)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tag)", textTransform: "lowercase", color: "var(--mb-g-800)" }}>{sectionName}</span>
          )}
        </div>
        {hasMeta && (
          <TaskMeta due={due} overdue={overdue} minutes={minutes} when={when} repeat={repeat} booked={booked} hit gap={8} onBook={stop(onBook)} />
        )}
      </div>
      {urgency && (
        <div style={{ flex: "none", paddingTop: 1 }}>
          <UrgencyPill urgency={urgency} customLabel={customLabel} display={urgencyDisplay} hit onClick={stop(onPressUrgency)} />
        </div>
      )}
    </div>
  );
}
