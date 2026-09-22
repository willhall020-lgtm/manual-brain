import React from "react";
import { URGENCY } from "../tasks/UrgencyPill.jsx";

export function UrgencyChipRow({ value = "Today", size = "md", onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: size === "touch" ? 7 : 5 }}>
      {URGENCY.map((u) => {
        const on = value === u.k;
        return (
          <button
            key={u.k}
            type="button"
            className="mb-chip"
            onClick={() => onChange && onChange(u.k)}
            style={{
              background: on ? u.bg : "var(--surface-card)",
              color: on ? u.fg : "var(--text-subtle)",
              border: on ? u.bd : "1px solid var(--border-control)",
              borderRadius: "var(--radius-pill)", whiteSpace: "nowrap",
              padding: size === "touch" ? "12px 16px" : "5px 10px",
              minHeight: size === "touch" ? 44 : undefined,
              fontSize: size === "touch" ? 13 : "var(--fs-chip)", fontWeight: "var(--fw-bold)", textTransform: "lowercase",
            }}
          >
            {u.k}
          </button>
        );
      })}
    </div>
  );
}
