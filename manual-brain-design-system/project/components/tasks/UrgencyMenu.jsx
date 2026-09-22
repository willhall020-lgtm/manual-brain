import React from "react";
import { URGENCY } from "./UrgencyPill.jsx";

export function UrgencyMenu({ onPick, align = "right" }) {
  return (
    <div
      style={{
        position: "absolute", top: "calc(100% + 7px)", [align]: 0, zIndex: 30,
        width: "var(--menu-width)", background: "var(--surface-card)",
        border: "1px solid #E4E4DE", borderRadius: "var(--radius-menu)", padding: 6,
        boxShadow: "var(--shadow-menu)", display: "flex", flexDirection: "column", gap: 1,
      }}
    >
      {URGENCY.map((u) => (
        <button
          key={u.k}
          onClick={() => onPick && onPick(u.k)}
          className="mb-menuitem"
          style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 8px", border: 0, borderRadius: "var(--radius-menuitem)", background: "transparent", fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-body)", textAlign: "left", textTransform: "lowercase" }}
        >
          <span style={{ flex: "none", width: 10, height: 10, borderRadius: "var(--radius-pill)", background: u.bg, border: u.bd }} />
          {u.k}
        </button>
      ))}
    </div>
  );
}
