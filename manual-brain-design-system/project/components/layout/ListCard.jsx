import React from "react";

export function ListCard({ name, taskCount = 0, dueCount = 0, todayCount = 0, soonCount = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mb-sectionbox"
      style={{ textAlign: "left", background: "var(--surface-card)", border: "1px solid var(--border-card)", borderRadius: "var(--radius-card)", padding: "var(--pad-list-card)", display: "flex", flexDirection: "column", gap: 22, minHeight: "var(--list-card-height)", transition: "transform .12s ease, border-color .12s ease" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, width: "100%" }}>
        <span style={{ fontSize: "var(--fs-list-title)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-list-title)", lineHeight: "var(--lh-tight)", textTransform: "lowercase" }}>{name}</span>
        <span style={{ flex: "none", fontSize: 15, fontWeight: "var(--fw-bold)", color: "var(--mb-n-950)" }}>→</span>
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)" }}>{taskCount === 1 ? "1 task" : taskCount + " tasks"}</span>
        {dueCount > 0 && (
          <span style={{ background: "var(--mb-lime)", color: "var(--mb-ink)", borderRadius: "var(--radius-pill)", padding: "3px 9px", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-black)", letterSpacing: ".03em" }}>{dueCount} due</span>
        )}
        {todayCount > 0 && (
          <span style={{ background: "var(--mb-lime)", color: "var(--mb-ink)", borderRadius: "var(--radius-pill)", padding: "3px 9px", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-black)", letterSpacing: ".03em" }}>{todayCount} today</span>
        )}
        {soonCount > 0 && (
          <span style={{ background: "var(--mb-blue-tint)", color: "var(--mb-blue)", borderRadius: "var(--radius-pill)", padding: "3px 9px", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-black)", letterSpacing: ".03em" }}>{soonCount} soon</span>
        )}
      </div>
    </button>
  );
}
