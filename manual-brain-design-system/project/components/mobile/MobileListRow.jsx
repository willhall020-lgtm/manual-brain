import React from "react";

export function MobileListRow({ name, taskCount = 0, dueCount = 0, todayCount = 0, soonCount = 0, onClick }) {
  const pill = (label, bg, fg) => (
    <span key={label} style={{ background: bg, color: fg, borderRadius: "var(--radius-pill)", padding: "3px 9px", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-black)", letterSpacing: ".03em" }}>{label}</span>
  );
  return (
    <button
      onClick={onClick}
      className="mb-sectionbox"
      style={{ width: "100%", textAlign: "left", background: "var(--surface-card)", border: "1px solid var(--border-card)", borderRadius: "var(--radius-card)", padding: "15px 16px", display: "flex", alignItems: "center", gap: 12, minHeight: 72, transition: "border-color .12s ease" }}
    >
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 9 }}>
        <span style={{ fontSize: 17, fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-list-title)", lineHeight: "var(--lh-tight)", textTransform: "lowercase" }}>{name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)" }}>{taskCount === 1 ? "1 task" : taskCount + " tasks"}</span>
          {dueCount > 0 && pill(dueCount + " due", "var(--mb-lime)", "var(--mb-ink)")}
          {todayCount > 0 && pill(todayCount + " today", "var(--mb-lime)", "var(--mb-ink)")}
          {soonCount > 0 && pill(soonCount + " soon", "var(--mb-blue-tint)", "var(--mb-blue)")}
        </div>
      </div>
      <span style={{ flex: "none", fontSize: 16, fontWeight: "var(--fw-bold)", color: "var(--mb-n-950)" }}>→</span>
    </button>
  );
}
