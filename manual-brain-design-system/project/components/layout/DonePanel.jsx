import React from "react";
import { DoneTaskRow } from "../tasks/DoneTaskRow.jsx";

export function DonePanel({ items = [], open = false, onToggle, onUndo }) {
  return (
    <div style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-panel)", padding: 6 }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: 0, padding: 12, textAlign: "left" }}>
        <span style={{ fontSize: "var(--fs-eyebrow)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-eyebrow)", color: "var(--text-muted)" }}>done</span>
        <span style={{ background: "var(--mb-n-750)", color: "var(--mb-g-900)", borderRadius: "var(--radius-pill)", padding: "2px 8px", fontSize: "var(--fs-chip)", fontWeight: "var(--fw-bold)" }}>{items.length}</span>
        <span style={{ marginLeft: "auto", fontSize: "var(--fs-chip)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)" }}>{open ? "hide ▲" : "show ▼"}</span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "0 8px 8px" }}>
          {items.map((d) => (
            <DoneTaskRow key={d.id} name={d.name} sectionName={d.sectionName} onUndo={() => onUndo && onUndo(d.id)} />
          ))}
          {items.length === 0 && (
            <div style={{ padding: "10px 12px", fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-semibold)", color: "var(--icon-rest)" }}>nothing finished yet today.</div>
          )}
        </div>
      )}
    </div>
  );
}
