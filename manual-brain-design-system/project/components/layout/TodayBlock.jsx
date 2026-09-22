import React from "react";

export function TodayBlock({ count = 0, note = "Pick one and start there. Everything else is tucked away below.", children }) {
  return (
    <div style={{ background: "var(--surface-today)", borderRadius: "var(--radius-panel)", padding: "var(--pad-today-block)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: "var(--fs-today-count)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-today-count)", lineHeight: 1 }}>{count}</span>
          <span style={{ fontSize: "var(--fs-today-label)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-today-label)" }}>for today</span>
        </div>
        {note && <span style={{ fontSize: "var(--fs-meta)", fontWeight: "var(--fw-semibold)", color: "var(--text-on-lime)" }}>{note}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-row)" }}>{children}</div>
    </div>
  );
}
