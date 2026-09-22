import React from "react";
import { Sheet } from "./Sheet.jsx";
import { URGENCY } from "../tasks/UrgencyPill.jsx";

export function UrgencySheet({ open = false, value, onClose, onPick }) {
  return (
    <Sheet open={open} title="how urgent?" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {URGENCY.map((u) => {
          const on = u.k === value;
          return (
            <button
              key={u.k}
              onClick={() => onPick && onPick(u.k)}
              className="mb-menuitem"
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 48, padding: "0 10px", border: 0, borderRadius: "var(--radius-row)", background: on ? "var(--mb-n-100)" : "transparent", fontSize: 15, fontWeight: "var(--fw-semibold)", color: "var(--text-body)", textAlign: "left", textTransform: "lowercase" }}
            >
              <span style={{ flex: "none", width: 13, height: 13, borderRadius: "var(--radius-pill)", background: u.bg, border: u.bd }} />
              <span style={{ flex: 1 }}>{u.k}</span>
              {on && <span style={{ flex: "none", color: "var(--accent-focus)", fontSize: 13, fontWeight: "var(--fw-black)" }}>✓</span>}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
