import React from "react";

export function PageHeader({ dateLabel, title = "manual brain", meta }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: "var(--fs-eyebrow)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-eyebrow)", color: "var(--text-muted)" }}>{dateLabel}</span>
        <h1 style={{ margin: 0, fontSize: "var(--fs-wordmark)", fontWeight: "var(--fw-black)", letterSpacing: "var(--ls-wordmark)", lineHeight: "var(--lh-wordmark)", textTransform: "lowercase" }}>{title}</h1>
      </div>
      {meta && <span style={{ fontSize: "var(--fs-meta-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)" }}>{meta}</span>}
    </div>
  );
}
